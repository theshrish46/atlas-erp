import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { permissions } from "@/lib/db/schema/schema";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";

import { eq } from "drizzle-orm";

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

        const result = await db
            .select({
                id: permissions.id,
                key: permissions.key,
                description: permissions.description,
            })
            .from(permissions)
            .orderBy(permissions.key);

        return successResponse(
            {
                permissions: result,
            },
            "Permissions fetched successfully",
            200,
        );
    } catch (error) {
        console.error(
            "Get permissions error:",
            error,
        );

        return errorResponse(
            "Something went wrong while fetching permissions",
            "PERMISSIONS_FETCH_FAILED",
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

        const key =
            typeof body.key === "string"
                ? body.key.trim().toLowerCase()
                : "";

        const description =
            typeof body.description === "string"
                ? body.description.trim()
                : null;

        if (!key) {
            return errorResponse(
                "Permission key is required",
                "VALIDATION_ERROR",
                400,
            );
        }

        if (key.length < 2) {
            return errorResponse(
                "Permission key must contain at least 2 characters",
                "VALIDATION_ERROR",
                400,
            );
        }

        if (key.length > 150) {
            return errorResponse(
                "Permission key cannot exceed 150 characters",
                "VALIDATION_ERROR",
                400,
            );
        }

        // Example:
        // employees.view
        // employees.create
        // inventory.adjust

        const existingPermission =
            await db.query.permissions.findFirst({
                where: eq(
                    permissions.key,
                    key,
                ),
            });

        if (existingPermission) {
            return errorResponse(
                "A permission with this key already exists",
                "PERMISSION_ALREADY_EXISTS",
                409,
            );
        }

        const [createdPermission] =
            await db
                .insert(permissions)
                .values({
                    key,
                    description,
                })
                .returning();

        if (!createdPermission) {
            return errorResponse(
                "Failed to create permission",
                "PERMISSION_CREATION_FAILED",
                500,
            );
        }

        return successResponse(
            {
                permission: createdPermission,
            },
            "Permission created successfully",
            201,
        );
    } catch (error) {
        console.error(
            "Create permission error:",
            error,
        );

        return errorResponse(
            "Something went wrong while creating the permission",
            "PERMISSION_CREATION_FAILED",
            500,
        );
    }
}