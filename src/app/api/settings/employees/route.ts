import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
    users,
    employees,
} from "@/lib/db/schema/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/hash";
import { verifyAccessToken } from "@/lib/auth/jwt";
import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";
import { z } from "zod";

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
});

async function getAuthenticatedUser(req: NextRequest) {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return null;
    }

    const token = authorization.substring(7);

    try {
        return await verifyAccessToken(token);
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(req);

        if (!auth) {
            return errorResponse(
                "Authentication required",
                "UNAUTHORIZED",
                401
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
            })
            .from(employees)
            .innerJoin(
                users,
                eq(employees.userId, users.id)
            )
            .where(
                eq(
                    employees.companyId,
                    auth.companyId
                )
            );

        return successResponse(
            {
                employees: employeeList,
            },
            "Employees fetched successfully",
            200
        );
    } catch (error) {
        console.error(
            "Get employees error:",
            error
        );

        return errorResponse(
            "Something went wrong while fetching employees",
            "EMPLOYEES_FETCH_FAILED",
            500
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(req);

        if (!auth) {
            return errorResponse(
                "Authentication required",
                "UNAUTHORIZED",
                401
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
                parsed.error.flatten()
            );
        }

        const {
            fullName,
            email,
            password,
        } = parsed.data;

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await db.query.users.findFirst({
                where: eq(
                    users.email,
                    normalizedEmail
                ),
            });

        if (existingUser) {
            return errorResponse(
                "An account with this email already exists",
                "EMAIL_ALREADY_EXISTS",
                409
            );
        }

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
                        "Failed to create user"
                    );
                }

                const [createdEmployee] =
                    await tx
                        .insert(employees)
                        .values({
                            userId: createdUser.id,
                            companyId: auth.companyId,
                            fullName: fullName.trim(),
                        })
                        .returning();

                if (!createdEmployee) {
                    throw new Error(
                        "Failed to create employee"
                    );
                }

                return {
                    user: createdUser,
                    employee: createdEmployee,
                };
            }
        );

        return successResponse(
            {
                employee: {
                    id: result.employee.id,
                    userId: result.user.id,
                    fullName:
                        result.employee.fullName,
                    email: result.user.email,
                    isActive:
                        result.user.isActive,
                },
            },
            "Employee created successfully",
            201
        );
    } catch (error) {
        console.error(
            "Create employee error:",
            error
        );

        return errorResponse(
            "Something went wrong while creating the employee",
            "EMPLOYEE_CREATION_FAILED",
            500
        );
    }
}