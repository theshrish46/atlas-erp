import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
    users,
    employees,
    roles,
    departments,
    employeeRoles,
    employeeDepartments,
} from "@/lib/db/schema/schema";
import { eq, and, inArray } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/hash";
import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const createEmployeeSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(255, "Full name is too long"),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address")
        .max(255),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100),

    roleId: z
        .string()
        .uuid()
        .nullable()
        .optional(),

    departmentIds: z
        .array(z.string().uuid())
        .optional()
        .default([]),
});

/* -------------------------------------------------------------------------- */
/* GET EMPLOYEES                                                              */
/* -------------------------------------------------------------------------- */

export async function GET(req: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(req);

        if (!auth) {
            return errorResponse(
                "Authentication required",
                "UNAUTHORIZED",
                401,
            );
        }

        const employeeList = await db
            .select({
                id: employees.id,
                userId: employees.userId,
                fullName: employees.fullName,
                email: users.email,
                isActive: users.isActive,
                createdAt: employees.createdAt,
                updatedAt: employees.updatedAt,

                roleId: roles.id,
                roleName: roles.name,
                roleDescription: roles.description,

                departmentId: departments.id,
                departmentName: departments.name,
            })
            .from(employees)
            .innerJoin(
                users,
                eq(employees.userId, users.id),
            )
            .leftJoin(
                employeeRoles,
                eq(
                    employeeRoles.employeeId,
                    employees.id,
                ),
            )
            .leftJoin(
                roles,
                eq(
                    employeeRoles.roleId,
                    roles.id,
                ),
            )
            .leftJoin(
                employeeDepartments,
                eq(
                    employeeDepartments.employeeId,
                    employees.id,
                ),
            )
            .leftJoin(
                departments,
                eq(
                    employeeDepartments.departmentId,
                    departments.id,
                ),
            )
            .where(
                eq(
                    employees.companyId,
                    auth.companyId,
                ),
            );

        /*
         * Because the SQL query creates one row per
         * employee/department combination, we group
         * the result back into employees.
         */

        const employeeMap = new Map<
            string,
            {
                id: string;
                userId: string;
                fullName: string;
                email: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                role: {
                    id: string;
                    name: string;
                    description: string | null;
                } | null;
                departments: {
                    id: string;
                    name: string;
                }[];
            }
        >();

        for (const row of employeeList) {
            let employee = employeeMap.get(row.id);

            if (!employee) {
                employee = {
                    id: row.id,
                    userId: row.userId,
                    fullName: row.fullName,
                    email: row.email,
                    isActive: row.isActive,
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt,

                    role: row.roleId
                        ? {
                            id: row.roleId,
                            name: row.roleName!,
                            description:
                                row.roleDescription,
                        }
                        : null,

                    departments: [],
                };

                employeeMap.set(
                    row.id,
                    employee,
                );
            }

            if (
                row.departmentId &&
                !employee.departments.some(
                    (department) =>
                        department.id ===
                        row.departmentId,
                )
            ) {
                employee.departments.push({
                    id: row.departmentId,
                    name: row.departmentName!,
                });
            }
        }

        return successResponse(
            {
                employees: Array.from(
                    employeeMap.values(),
                ),
            },
            "Employees fetched successfully",
            200,
        );
    } catch (error) {
        console.error(
            "Get employees error:",
            error,
        );

        return errorResponse(
            "Something went wrong while fetching employees",
            "EMPLOYEES_FETCH_FAILED",
            500,
        );
    }
}

/* -------------------------------------------------------------------------- */
/* CREATE EMPLOYEE                                                            */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(req);

        if (!auth) {
            return errorResponse(
                "Authentication required",
                "UNAUTHORIZED",
                401,
            );
        }

        const body = await req.json();

        const parsed =
            createEmployeeSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                "Validation failed",
                "VALIDATION_ERROR",
                400,
                parsed.error.flatten(),
            );
        }

        const {
            fullName,
            email,
            password,
            roleId,
            departmentIds,
        } = parsed.data;

        const normalizedEmail =
            email.trim().toLowerCase();

        /* ------------------------------------------------------------------ */
        /* Check existing user                                                */
        /* ------------------------------------------------------------------ */

        const existingUser =
            await db.query.users.findFirst({
                where: eq(
                    users.email,
                    normalizedEmail,
                ),
            });

        if (existingUser) {
            return errorResponse(
                "An account with this email already exists",
                "EMAIL_ALREADY_EXISTS",
                409,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Validate role belongs to company                                   */
        /* ------------------------------------------------------------------ */

        if (roleId) {
            const role =
                await db.query.roles.findFirst({
                    where: and(
                        eq(
                            roles.id,
                            roleId,
                        ),
                        eq(
                            roles.companyId,
                            auth.companyId,
                        ),
                    ),
                });

            if (!role) {
                return errorResponse(
                    "Selected role does not belong to this company",
                    "INVALID_ROLE",
                    400,
                );
            }
        }

        /* ------------------------------------------------------------------ */
        /* Validate departments belong to company                             */
        /* ------------------------------------------------------------------ */

        if (departmentIds.length > 0) {
            const companyDepartments =
                await db
                    .select({
                        id: departments.id,
                    })
                    .from(departments)
                    .where(
                        and(
                            eq(
                                departments.companyId,
                                auth.companyId,
                            ),
                            inArray(
                                departments.id,
                                departmentIds,
                            ),
                        ),
                    );

            if (
                companyDepartments.length !==
                departmentIds.length
            ) {
                return errorResponse(
                    "One or more selected departments do not belong to this company",
                    "INVALID_DEPARTMENT",
                    400,
                );
            }
        }

        /* ------------------------------------------------------------------ */
        /* Create everything in one transaction                              */
        /* ------------------------------------------------------------------ */

        const passwordHash =
            await hashPassword(password);

        const result = await db.transaction(
            async (tx) => {
                const [createdUser] =
                    await tx
                        .insert(users)
                        .values({
                            email: normalizedEmail,
                            passwordHash,
                            isActive: true,
                        })
                        .returning();

                if (!createdUser) {
                    throw new Error(
                        "Failed to create user",
                    );
                }

                const [createdEmployee] =
                    await tx
                        .insert(employees)
                        .values({
                            userId: createdUser.id,
                            companyId:
                                auth.companyId,
                            fullName:
                                fullName.trim(),
                        })
                        .returning();

                if (!createdEmployee) {
                    throw new Error(
                        "Failed to create employee",
                    );
                }

                /* ---------------------------------------------------------- */
                /* Assign role                                                 */
                /* ---------------------------------------------------------- */

                if (roleId) {
                    await tx
                        .insert(employeeRoles)
                        .values({
                            employeeId:
                                createdEmployee.id,
                            roleId,
                        });
                }

                /* ---------------------------------------------------------- */
                /* Assign departments                                          */
                /* ---------------------------------------------------------- */

                if (
                    departmentIds.length > 0
                ) {
                    await tx
                        .insert(
                            employeeDepartments,
                        )
                        .values(
                            departmentIds.map(
                                (departmentId) => ({
                                    employeeId:
                                        createdEmployee.id,
                                    departmentId,
                                }),
                            ),
                        );
                }

                return {
                    user: createdUser,
                    employee:
                        createdEmployee,
                };
            },
        );

        /* ------------------------------------------------------------------ */
        /* Return hydrated employee                                           */
        /* ------------------------------------------------------------------ */

        const createdEmployee =
            await getEmployeeById(
                result.employee.id,
                auth.companyId,
            );

        return successResponse(
            {
                employee: createdEmployee,
            },
            "Employee created successfully",
            201,
        );
    } catch (error) {
        console.error(
            "Create employee error:",
            error,
        );

        return errorResponse(
            "Something went wrong while creating the employee",
            "EMPLOYEE_CREATION_FAILED",
            500,
        );
    }
}

/* -------------------------------------------------------------------------- */
/* Helper                                                                     */
/* -------------------------------------------------------------------------- */

async function getEmployeeById(
    employeeId: string,
    companyId: string,
) {
    const rows = await db
        .select({
            id: employees.id,
            userId: employees.userId,
            fullName: employees.fullName,
            email: users.email,
            isActive: users.isActive,
            createdAt: employees.createdAt,
            updatedAt: employees.updatedAt,

            roleId: roles.id,
            roleName: roles.name,
            roleDescription: roles.description,

            departmentId: departments.id,
            departmentName: departments.name,
        })
        .from(employees)
        .innerJoin(
            users,
            eq(employees.userId, users.id),
        )
        .leftJoin(
            employeeRoles,
            eq(
                employeeRoles.employeeId,
                employees.id,
            ),
        )
        .leftJoin(
            roles,
            eq(
                employeeRoles.roleId,
                roles.id,
            ),
        )
        .leftJoin(
            employeeDepartments,
            eq(
                employeeDepartments.employeeId,
                employees.id,
            ),
        )
        .leftJoin(
            departments,
            eq(
                employeeDepartments.departmentId,
                departments.id,
            ),
        )
        .where(
            and(
                eq(
                    employees.id,
                    employeeId,
                ),
                eq(
                    employees.companyId,
                    companyId,
                ),
            ),
        );

    if (rows.length === 0) {
        return null;
    }

    const first = rows[0];

    return {
        id: first.id,
        userId: first.userId,
        fullName: first.fullName,
        email: first.email,
        isActive: first.isActive,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt,

        role: first.roleId
            ? {
                id: first.roleId,
                name: first.roleName!,
                description:
                    first.roleDescription,
            }
            : null,

        departments: Array.from(
            new Map(
                rows
                    .filter(
                        (row) =>
                            row.departmentId,
                    )
                    .map((row) => [
                        row.departmentId!,
                        {
                            id: row.departmentId!,
                            name: row.departmentName!,
                        },
                    ]),
            ).values(),
        ),
    };
}