import { NextRequest } from "next/server";
import { db } from "@/lib/db";

import {
    roles,
    permissions,
    rolePermissions,
} from "@/lib/db/schema/schema";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";

import { and, eq, inArray } from "drizzle-orm";

type RouteContext = {
    params: Promise<{
        roleId: string;
    }>;
};

/**
 * GET
 *
 * Returns all permissions currently assigned
 * to the specified role.
 *
 * GET
 * /api/settings/roles/:roleId/permissions
 */
export async function GET(
    req: NextRequest,
    context: RouteContext,
) {
    try {
        const auth = await getAuthenticatedUser(req);

        if (!auth) {
            return errorResponse(
                "Authentication required",
                "UNAUTHORIZED",
                401,
            );
        }

        const { roleId } = await context.params;

        if (!roleId) {
            return errorResponse(
                "Role ID is required",
                "ROLE_ID_REQUIRED",
                400,
            );
        }

        // Make sure the role belongs to
        // the authenticated user's company.
        const role = await db.query.roles.findFirst({
            where: and(
                eq(roles.id, roleId),
                eq(roles.companyId, auth.companyId),
            ),
        });

        if (!role) {
            return errorResponse(
                "Role not found",
                "ROLE_NOT_FOUND",
                404,
            );
        }

        const assignedPermissions = await db
            .select({
                id: permissions.id,
                key: permissions.key,
                description: permissions.description,
            })
            .from(rolePermissions)
            .innerJoin(
                permissions,
                eq(
                    rolePermissions.permissionId,
                    permissions.id,
                ),
            )
            .where(
                eq(
                    rolePermissions.roleId,
                    roleId,
                ),
            )
            .orderBy(permissions.key);

        return successResponse(
            {
                role: {
                    id: role.id,
                    name: role.name,
                },

                permissions: assignedPermissions,
            },
            "Role permissions fetched successfully",
            200,
        );
    } catch (error) {
        console.error(
            "Get role permissions error:",
            error,
        );

        return errorResponse(
            "Something went wrong while fetching role permissions",
            "ROLE_PERMISSIONS_FETCH_FAILED",
            500,
        );
    }
}

/**
 * PUT
 *
 * Replace all permissions assigned to a role.
 *
 * Body:
 *
 * {
 *     "permissionIds": [
 *         "uuid-1",
 *         "uuid-2",
 *         "uuid-3"
 *     ]
 * }
 *
 * The table only contains:
 *
 * roleId
 * permissionId
 *
 * so we delete the existing assignments
 * and recreate the selected assignments.
 */
export async function PUT(
    req: NextRequest,
    context: RouteContext,
) {
    try {
        const auth = await getAuthenticatedUser(req);

        if (!auth) {
            return errorResponse(
                "Authentication required",
                "UNAUTHORIZED",
                401,
            );
        }

        const { roleId } = await context.params;

        if (!roleId) {
            return errorResponse(
                "Role ID is required",
                "ROLE_ID_REQUIRED",
                400,
            );
        }

        const body = await req.json();

        /*
         * Validate permissionIds.
         */
        if (!Array.isArray(body.permissionIds)) {
            return errorResponse(
                "permissionIds must be an array",
                "INVALID_PERMISSION_IDS",
                400,
            );
        }

        /*
         * Remove duplicates and make sure
         * every value is a string.
         */
        const permissionIds = [
            ...new Set(
                body.permissionIds.filter(
                    (id: unknown): id is string =>
                        typeof id === "string" &&
                        id.trim().length > 0,
                ),
            ),
        ];

        /*
         * Verify that the role belongs to
         * the authenticated user's company.
         */
        const role = await db.query.roles.findFirst({
            where: and(
                eq(roles.id, roleId),
                eq(roles.companyId, auth.companyId),
            ),
        });

        if (!role) {
            return errorResponse(
                "Role not found",
                "ROLE_NOT_FOUND",
                404,
            );
        }

        /*
         * If permissions were supplied,
         * make sure every permission actually exists.
         */
        if (permissionIds.length > 0) {
            const existingPermissions =
                await db
                    .select({
                        id: permissions.id,
                    })
                    .from(permissions)
                    .where(
                        inArray(
                            permissions.id,
                            permissionIds,
                        ),
                    );

            const existingPermissionIds =
                new Set(
                    existingPermissions.map(
                        (permission) =>
                            permission.id,
                    ),
                );

            const invalidPermissionIds =
                permissionIds.filter(
                    (id) =>
                        !existingPermissionIds.has(
                            id,
                        ),
                );

            if (
                invalidPermissionIds.length > 0
            ) {
                return errorResponse(
                    "One or more permissions do not exist",
                    "PERMISSION_NOT_FOUND",
                    404,
                    {
                        invalidPermissionIds,
                    },
                );
            }
        }

        /*
         * Update the role-permission relationships
         * atomically.
         */
        const result = await db.transaction(
            async (tx) => {
                /*
                 * Remove all existing permissions
                 * assigned to this role.
                 */
                await tx
                    .delete(rolePermissions)
                    .where(
                        eq(
                            rolePermissions.roleId,
                            roleId,
                        ),
                    );

                /*
                 * Add the newly selected permissions.
                 */
                if (permissionIds.length > 0) {
                    await tx
                        .insert(rolePermissions)
                        .values(
                            permissionIds.map(
                                (permissionId) => ({
                                    roleId,
                                    permissionId,
                                }),
                            ),
                        );
                }

                /*
                 * Fetch the final permission list.
                 */
                const updatedPermissions =
                    await tx
                        .select({
                            id: permissions.id,
                            key: permissions.key,
                            description:
                                permissions.description,
                        })
                        .from(rolePermissions)
                        .innerJoin(
                            permissions,
                            eq(
                                rolePermissions.permissionId,
                                permissions.id,
                            ),
                        )
                        .where(
                            eq(
                                rolePermissions.roleId,
                                roleId,
                            ),
                        )
                        .orderBy(
                            permissions.key,
                        );

                return updatedPermissions;
            },
        );

        return successResponse(
            {
                role: {
                    id: role.id,
                    name: role.name,
                },

                permissions: result,
            },
            "Role permissions updated successfully",
            200,
        );
    } catch (error) {
        console.error(
            "Update role permissions error:",
            error,
        );

        return errorResponse(
            "Something went wrong while updating role permissions",
            "ROLE_PERMISSIONS_UPDATE_FAILED",
            500,
        );
    }
}