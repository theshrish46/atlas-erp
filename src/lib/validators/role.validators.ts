import { z } from "zod";

export const createRoleSchema = z.object({
    name: z
        .string()
        .min(1, "Role name is required")
        .max(100, "Role name is too long"),

    description: z
        .string()
        .max(
            500,
            "Description is too long",
        )
        .optional(),

    permissionIds: z
        .array(z.string().uuid())
        .optional()
        .default([]),
});

export type CreateRoleInput = z.infer<
    typeof createRoleSchema
>;