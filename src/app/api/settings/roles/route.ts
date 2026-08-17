import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
    roles,
    permissions,
    rolePermissions,
} from "@/lib/db/schema/schema";
import { eq, and, inArray } from "drizzle-orm";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { createRoleSchema } from "@/lib/validators/role.validators";

import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";


// ============================================================
// GET /api/settings/roles
// ============================================================

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

        const companyRoles = await db
            .select({
                id: roles.id,
                name: roles.name,
                description: roles.description,
                isSystem: roles.isSystem,
                companyId: roles.companyId,
                createdAt: roles.createdAt,
                updatedAt: roles.updatedAt,
            })
            .from(roles)
            .where(
                eq(
                    roles.companyId,
                    auth.companyId,
                ),
            )
            .orderBy(roles.name);

        if (companyRoles.length === 0) {
            return successResponse(
                {
                    roles: [],
                },
                "Roles fetched successfully",
                200,
            );
        }

        const roleIds = companyRoles.map(
            (role) => role.id,
        );

        const permissionRows = await db
            .select({
                roleId: rolePermissions.roleId,
                permissionId: permissions.id,
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
                inArray(
                    rolePermissions.roleId,
                    roleIds,
                ),
            );

        const formattedRoles = companyRoles.map(
            (role) => ({
                ...role,

                permissions: permissionRows
                    .filter(
                        (permission) =>
                            permission.roleId ===
                            role.id,
                    )
                    .map((permission) => ({
                        id: permission.permissionId,
                        key: permission.key,
                        description:
                            permission.description,
                    })),
            }),
        );

        return successResponse(
            {
                roles: formattedRoles,
            },
            "Roles fetched successfully",
            200,
        );
    } catch (error) {
        console.error(
            "Get roles error:",
            error,
        );

        return errorResponse(
            "Something went wrong while fetching roles",
            "ROLES_FETCH_FAILED",
            500,
        );
    }
}


// ============================================================
// POST /api/settings/roles
// ============================================================

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
            createRoleSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                "Validation failed",
                "VALIDATION_ERROR",
                400,
                parsed.error.flatten(),
            );
        }

        const {
            name,
            description,
            permissionIds,
        } = parsed.data;

        const normalizedName = name.trim();

        if (!normalizedName) {
            return errorResponse(
                "Role name is required",
                "INVALID_ROLE_NAME",
                400,
            );
        }

        // ----------------------------------------------------
        // Check whether role already exists in this company
        // ----------------------------------------------------

        const existingRole =
            await db.query.roles.findFirst({
                where: and(
                    eq(
                        roles.companyId,
                        auth.companyId,
                    ),
                    eq(
                        roles.name,
                        normalizedName,
                    ),
                ),
            });

        if (existingRole) {
            return errorResponse(
                "A role with this name already exists",
                "ROLE_ALREADY_EXISTS",
                409,
            );
        }

        // ----------------------------------------------------
        // Create role + permissions in one transaction
        // ----------------------------------------------------

        const result = await db.transaction(
            async (tx) => {
                const [createdRole] =
                    await tx
                        .insert(roles)
                        .values({
                            companyId:
                                auth.companyId,

                            name:
                                normalizedName,

                            description:
                                description?.trim() ||
                                null,

                            isSystem: false,
                        })
                        .returning();

                if (!createdRole) {
                    throw new Error(
                        "Failed to create role",
                    );
                }

                let createdPermissions: Array<{
                    id: string;
                    key: string;
                    description: string | null;
                }> = [];

                // ------------------------------------------------
                // Attach permissions if supplied
                // ------------------------------------------------

                if (
                    permissionIds &&
                    permissionIds.length > 0
                ) {
                    const validPermissions =
                        await tx
                            .select({
                                id: permissions.id,
                                key: permissions.key,
                                description:
                                    permissions.description,
                            })
                            .from(permissions)
                            .where(
                                inArray(
                                    permissions.id,
                                    permissionIds,
                                ),
                            );

                    // Make sure every requested permission
                    // actually exists.
                    if (
                        validPermissions.length !==
                        permissionIds.length
                    ) {
                        throw new Error(
                            "One or more permissions are invalid",
                        );
                    }

                    await tx
                        .insert(rolePermissions)
                        .values(
                            permissionIds.map(
                                (permissionId) => ({
                                    roleId:
                                        createdRole.id,
                                    permissionId,
                                }),
                            ),
                        );

                    createdPermissions =
                        validPermissions;
                }

                return {
                    role: createdRole,
                    permissions:
                        createdPermissions,
                };
            },
        );

        return successResponse(
            {
                role: {
                    ...result.role,

                    permissions:
                        result.permissions,
                },
            },
            "Role created successfully",
            201,
        );
    } catch (error) {
        console.error(
            "Create role error:",
            error,
        );

        return errorResponse(
            "Something went wrong while creating the role",
            "ROLE_CREATION_FAILED",
            500,
        );
    }
}