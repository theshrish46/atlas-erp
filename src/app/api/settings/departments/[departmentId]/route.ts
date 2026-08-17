import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/schema";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

/* -------------------------------------------------------------------------- */
/* PUT — Update Department                                                    */
/* -------------------------------------------------------------------------- */

export async function PUT(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ departmentId: string }>;
    },
) {
    try {
        const user = await getAuthenticatedUser(req);

        if (!user?.companyId) {
            return NextResponse.json(
                {
                    error: "Unauthorized.",
                },
                { status: 401 },
            );
        }

        const { departmentId } = await params;

        const body = await req.json();

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        const description =
            typeof body.description === "string"
                ? body.description.trim() || null
                : null;

        if (!name) {
            return NextResponse.json(
                {
                    error: "Department name is required.",
                },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Check department                                                   */
        /* ------------------------------------------------------------------ */

        const existingDepartment =
            await db.query.departments.findFirst({
                where: and(
                    eq(
                        departments.id,
                        departmentId,
                    ),
                    eq(
                        departments.companyId,
                        user.companyId,
                    ),
                ),
            });

        if (!existingDepartment) {
            return NextResponse.json(
                {
                    error: "Department not found.",
                },
                { status: 404 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Check duplicate name                                               */
        /* ------------------------------------------------------------------ */

        const duplicate =
            await db.query.departments.findFirst({
                where: and(
                    eq(
                        departments.companyId,
                        user.companyId,
                    ),
                    eq(
                        departments.name,
                        name,
                    ),
                ),
            });

        if (
            duplicate &&
            duplicate.id !== departmentId
        ) {
            return NextResponse.json(
                {
                    error:
                        "A department with this name already exists.",
                },
                { status: 409 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Update department                                                  */
        /* ------------------------------------------------------------------ */

        const [department] =
            await db
                .update(departments)
                .set({
                    name,
                    description,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(
                            departments.id,
                            departmentId,
                        ),
                        eq(
                            departments.companyId,
                            user.companyId,
                        ),
                    ),
                )
                .returning();

        return successResponse(
            {
                department: department,
            },
            `Updated ${department.name} successfully`,
            201
        )
    } catch (error) {
        console.error(
            "Failed to update department:",
            error,
        );

        return errorResponse(
            "Something went wrong while updating the department",
            "DEPARTMENT_CREATION_FAILED",
            500,
        );
    }
}

/* -------------------------------------------------------------------------- */
/* DELETE — Delete Department                                                 */
/* -------------------------------------------------------------------------- */

export async function DELETE(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ departmentId: string }>;
    },
) {
    try {
        const user = await getAuthenticatedUser(req);

        if (!user?.companyId) {
            return NextResponse.json(
                {
                    error: "Unauthorized.",
                },
                { status: 401 },
            );
        }

        const { departmentId } = await params;

        /* ------------------------------------------------------------------ */
        /* Check department                                                   */
        /* ------------------------------------------------------------------ */

        const existingDepartment =
            await db.query.departments.findFirst({
                where: and(
                    eq(
                        departments.id,
                        departmentId,
                    ),
                    eq(
                        departments.companyId,
                        user.companyId,
                    ),
                ),
            });

        if (!existingDepartment) {
            return NextResponse.json(
                {
                    error: "Department not found.",
                },
                { status: 404 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* Delete department                                                  */
        /* ------------------------------------------------------------------ */

        await db
            .delete(departments)
            .where(
                and(
                    eq(
                        departments.id,
                        departmentId,
                    ),
                    eq(
                        departments.companyId,
                        user.companyId,
                    ),
                ),
            );

        return NextResponse.json({
            success: true,
            message:
                "Department deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Failed to delete department:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete department.",
            },
            { status: 500 },
        );
    }
}