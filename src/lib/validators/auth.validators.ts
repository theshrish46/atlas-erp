import { z } from "zod";

export const registerSchema = z.object({
    companyName: z.string().trim().min(2).max(255),

    website: z
        .string()
        .trim()
        .url()
        .optional()
        .or(z.literal("")),

    country: z.string().trim().min(2).max(100),

    state: z.string().trim().min(2).max(100),

    city: z.string().trim().min(2).max(100),

    timezone: z.string().trim().min(2).max(50),

    fullName: z.string().trim().min(2).max(255),

    email: z.string().trim().email().max(255),

    password: z
        .string()
        .min(8)
        .max(128)
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});



export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;