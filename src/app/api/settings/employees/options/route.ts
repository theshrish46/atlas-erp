import { NextRequest } from "next/server";

import { db } from "@/lib/db";

import {
    roles,
    departments,
} from "@/lib/db/schema/schema";

import { eq } from "drizzle-orm";

import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

export async function GET(req: NextRequest) {
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

        const [companyRoles, companyDepartments] =
            await Promise.all([
                db
                    .select({
                        id: roles.id,
                        name: roles.name,
                        description:
                            roles.description,
                    })
                    .from(roles)
                    .where(
                        eq(
                            roles.companyId,
                            auth.companyId,
                        ),
                    ),

                db
                    .select({
                        id: departments.id,
                        name: departments.name,
                    })
                    .from(departments)
                    .where(
                        eq(
                            departments.companyId,
                            auth.companyId,
                        ),
                    ),
            ]);

        return successResponse(
            {
                roles: companyRoles,
                departments:
                    companyDepartments,
            },
            "Employee options fetched successfully",
            200,
        );
    } catch (error) {
        console.error(
            "Get employee options error:",
            error,
        );

        return errorResponse(
            "Failed to fetch employee options",
            "EMPLOYEE_OPTIONS_FETCH_FAILED",
            500,
        );
    }
}