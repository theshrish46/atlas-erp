import { z } from "zod";

export const createDepartmentSchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            2,
            "Department name must contain at least 2 characters",
        )
        .max(
            255,
            "Department name cannot exceed 255 characters",
        ),
});

export type CreateDepartmentInput = z.infer<
    typeof createDepartmentSchema
>;