import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
    departments,
    employeeDepartments,
} from "@/lib/db/schema/schema";
import { eq, and, count } from "drizzle-orm";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { createDepartmentSchema } from "@/lib/validators/department.validators";

import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";

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

        const departmentList = await db
            .select({
                id: departments.id,
                name: departments.name,
                companyId: departments.companyId,
                createdAt: departments.createdAt,
                updatedAt: departments.updatedAt,
                employeeCount: count(
                    employeeDepartments.employeeId,
                ),
            })
            .from(departments)
            .leftJoin(
                employeeDepartments,
                eq(
                    employeeDepartments.departmentId,
                    departments.id,
                ),
            )
            .where(
                eq(
                    departments.companyId,
                    auth.companyId,
                ),
            )
            .groupBy(
                departments.id,
                departments.name,
                departments.companyId,
                departments.createdAt,
                departments.updatedAt,
            )
            .orderBy(departments.name);

        return successResponse(
            {
                departments: departmentList.map(
                    (item) => ({
                        ...item,
                        employeeCount:
                            Number(
                                item.employeeCount,
                            ),
                    }),
                ),
            },
            "Departments fetched successfully",
            200,
        );
    } catch (error) {
        console.error(
            "Get departments error:",
            error,
        );

        return errorResponse(
            "Something went wrong while fetching departments",
            "DEPARTMENTS_FETCH_FAILED",
            500,
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
                401,
            );
        }

        const body = await req.json();

        const parsed =
            createDepartmentSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                "Validation failed",
                "VALIDATION_ERROR",
                400,
                parsed.error.flatten(),
            );
        }

        const name = parsed.data.name.trim();

        if (!name) {
            return errorResponse(
                "Department name is required",
                "INVALID_DEPARTMENT_NAME",
                400,
            );
        }

        const existingDepartment =
            await db.query.departments.findFirst({
                where: and(
                    eq(
                        departments.companyId,
                        auth.companyId,
                    ),
                    eq(
                        departments.name,
                        name,
                    ),
                ),
            });

        if (existingDepartment) {
            return errorResponse(
                "A department with this name already exists",
                "DEPARTMENT_ALREADY_EXISTS",
                409,
            );
        }

        const [createdDepartment] =
            await db
                .insert(departments)
                .values({
                    name,
                    companyId: auth.companyId,
                })
                .returning();

        if (!createdDepartment) {
            return errorResponse(
                "Failed to create department",
                "DEPARTMENT_CREATION_FAILED",
                500,
            );
        }

        return successResponse(
            {
                department: {
                    ...createdDepartment,
                    employeeCount: 0,
                },
            },
            "Department created successfully",
            201,
        );
    } catch (error) {
        console.error(
            "Create department error:",
            error,
        );

        return errorResponse(
            "Something went wrong while creating the department",
            "DEPARTMENT_CREATION_FAILED",
            500,
        );
    }
}