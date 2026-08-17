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

import {
    eq,
    and,
    inArray,
} from "drizzle-orm";

import { z } from "zod";

import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const updateEmployeeSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2)
        .max(255),

    roleId: z
        .string()
        .uuid()
        .nullable()
        .optional(),

    departmentIds: z
        .array(z.string().uuid())
        .default([]),

    isActive: z.boolean(),
});

/* -------------------------------------------------------------------------- */
/* PUT                                                                        */
/* -------------------------------------------------------------------------- */

export async function PUT(
    req: NextRequest,
    context: {
        params: Promise<{
            employeeId: string;
        }>;
    },
) {
    try {
        const auth =
            await getAuthenticatedUser(req);

        if (!auth) {
            return errorResponse(
                "Authentication required",
                "UNAUTHORIZED",
                401,
            );
        }

        const { employeeId } =
            await context.params;

        const body = await req.json();

        const parsed =
            updateEmployeeSchema.safeParse(
                body,
            );

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
            roleId,
            departmentIds,
            isActive,
        } = parsed.data;

        /* ------------------------------------------------------------------ */
        /* Check employee belongs to company                                 */
        /* ------------------------------------------------------------------ */

        const existingEmployee =
            await db.query.employees.findFirst({
                where: and(
                    eq(
                        employees.id,
                        employeeId,
                    ),
                    eq(
                        employees.companyId,
                        auth.companyId,
                    ),
                ),
            });

        if (!existingEmployee) {
            return errorResponse(
                "Employee not found",
                "EMPLOYEE_NOT_FOUND",
                404,
            );
        }

        /* ------------------------------------------------------------------ */
        /* Validate role                                                       */
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
        /* Validate departments                                                */
        /* ------------------------------------------------------------------ */

        if (departmentIds.length > 0) {
            const validDepartments =
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
                validDepartments.length !==
                departmentIds.length
            ) {
                return errorResponse(
                    "One or more departments are invalid",
                    "INVALID_DEPARTMENT",
                    400,
                );
            }
        }

        /* ------------------------------------------------------------------ */
        /* Update everything transactionally                                  */
        /* ------------------------------------------------------------------ */

        await db.transaction(async (tx) => {
            /* -------------------------------------------------------------- */
            /* Employee                                                        */
            /* -------------------------------------------------------------- */

            await tx
                .update(employees)
                .set({
                    fullName:
                        fullName.trim(),
                    updatedAt:
                        new Date(),
                })
                .where(
                    eq(
                        employees.id,
                        employeeId,
                    ),
                );

            /* -------------------------------------------------------------- */
            /* User                                                             */
            /* -------------------------------------------------------------- */

            await tx
                .update(users)
                .set({
                    isActive,
                    updatedAt:
                        new Date(),
                })
                .where(
                    eq(
                        users.id,
                        existingEmployee.userId,
                    ),
                );

            /* -------------------------------------------------------------- */
            /* Remove existing role                                            */
            /* -------------------------------------------------------------- */

            await tx
                .delete(employeeRoles)
                .where(
                    eq(
                        employeeRoles.employeeId,
                        employeeId,
                    ),
                );

            /* -------------------------------------------------------------- */
            /* Assign new role                                                 */
            /* -------------------------------------------------------------- */

            if (roleId) {
                await tx
                    .insert(employeeRoles)
                    .values({
                        employeeId,
                        roleId,
                    });
            }

            /* -------------------------------------------------------------- */
            /* Remove existing departments                                     */
            /* -------------------------------------------------------------- */

            await tx
                .delete(employeeDepartments)
                .where(
                    eq(
                        employeeDepartments.employeeId,
                        employeeId,
                    ),
                );

            /* -------------------------------------------------------------- */
            /* Assign new departments                                          */
            /* -------------------------------------------------------------- */

            if (departmentIds.length > 0) {
                await tx
                    .insert(
                        employeeDepartments,
                    )
                    .values(
                        departmentIds.map(
                            (departmentId) => ({
                                employeeId,
                                departmentId,
                            }),
                        ),
                    );
            }
        });

        /* ------------------------------------------------------------------ */
        /* Return fresh employee                                              */
        /* ------------------------------------------------------------------ */

        const employee =
            await getEmployeeById(
                employeeId,
                auth.companyId,
            );

        return successResponse(
            {
                employee,
            },
            "Employee updated successfully",
            200,
        );
    } catch (error) {
        console.error(
            "Update employee error:",
            error,
        );

        return errorResponse(
            "Something went wrong while updating the employee",
            "EMPLOYEE_UPDATE_FAILED",
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
            eq(
                employees.userId,
                users.id,
            ),
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