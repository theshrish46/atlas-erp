import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
    users,
    companies,
    employees,
    roles,
    permissions,
    rolePermissions,
    employeeRoles,
    sessions,
    auditLogs,
} from "@/lib/db/schema/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/hash";
import { signAccessToken } from "@/lib/auth/jwt";
import { registerSchema } from "@/lib/validators/auth.validators";
import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";
import { generateCompanySlug } from "@/lib/utils/slug";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                "Validation failed",
                "VALIDATION_ERROR",
                400,
                parsed.error.flatten()
            );
        }

        const {
            companyName,
            website,
            country,
            state,
            city,
            timezone,
            fullName,
            email,
            password,
        } = parsed.data;

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        });

        if (existingUser) {
            return errorResponse(
                "An account with this email already exists",
                "EMAIL_ALREADY_EXISTS",
                409
            );
        }

        const baseSlug = generateCompanySlug(companyName);
        let slug = baseSlug;
        let counter = 1;

        while (
            await db.query.companies.findFirst({
                where: eq(companies.slug, slug),
            })
        ) {
            slug = `${baseSlug}-${counter++} `;
        }

        const passwordHash = await hashPassword(password);

        const result = await db.transaction(async (tx) => {
            const [createdUser] = await tx
                .insert(users)
                .values({
                    email: normalizedEmail,
                    passwordHash,
                })
                .returning();

            const [createdCompany] = await tx
                .insert(companies)
                .values({
                    name: companyName.trim(),
                    slug,
                    website: website || null,
                    country,
                    state,
                    city,
                    timezone,
                    isActive: true,
                })
                .returning();

            const [createdEmployee] = await tx
                .insert(employees)
                .values({
                    userId: createdUser.id,
                    companyId: createdCompany.id,
                    fullName: fullName.trim(),
                })
                .returning();

            let adminRole = await tx.query.roles.findFirst({
                where: and(
                    eq(roles.companyId, createdCompany.id),
                    eq(roles.name, "Admin")
                ),
            });

            if (!adminRole) {
                const [newRole] = await tx
                    .insert(roles)
                    .values({
                        companyId: createdCompany.id,
                        name: "Admin",
                        description: "Full administrative access to the workspace",
                        isSystem: true,
                    })
                    .returning();

                if (!newRole) {
                    throw new Error("Failed to create Admin role");
                }

                adminRole = newRole;

                const allPermissions = await tx.select().from(permissions);

                if (allPermissions.length > 0) {
                    const role = adminRole;

                    await tx.insert(rolePermissions).values(
                        allPermissions.map((permission) => ({
                            roleId: role.id,
                            permissionId: permission.id,
                        }))
                    );
                }
            }

            if (!adminRole) {
                throw new Error("Admin role not found or could not be created");
            }

            await tx.insert(employeeRoles).values({
                employeeId: createdEmployee.id,
                roleId: adminRole.id,
            });

            const [session] = await tx
                .insert(sessions)
                .values({
                    userId: createdUser.id,
                    tokenHash: "pending",
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                })
                .returning();

            const token = await signAccessToken({
                userId: createdUser.id,
                companyId: createdCompany.id,
                sessionId: session.id,
            });

            await tx.insert(sessions).values({
                userId: createdUser.id,
                tokenHash: token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            await tx.insert(auditLogs).values({
                companyId: createdCompany.id,
                userId: createdUser.id,
                action: "company.registered",
                entityType: "company",
                entityId: createdCompany.id,
                metadata: {
                    companyName: createdCompany.name,
                    ownerEmail: createdUser.email,
                },
            });

            return {
                user: createdUser,
                company: createdCompany,
                employee: createdEmployee,
                role: adminRole,
                token,
            };
        });

        return successResponse(
            {
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: `${result.employee.fullName}`.trim(),
                },
                company: {
                    id: result.company.id,
                    name: result.company.name,
                    slug: result.company.slug,
                },
                token: result.token,
            },
            "Workspace created successfully",
            201
        );

    } catch (error) {
        console.error("Registration error:",);
        console.error(error)

        return errorResponse(
            "Something went wrong while creating your workspace",
            "REGISTRATION_FAILED",
            500
        );

    }
}


export async function GET(req: NextRequest) {
    return successResponse(
        {
            user: {
                id: 234,
                email: "test@test.com",
                name: "test",
            },
            company: {
                id: 233,
                name: "TEst",
                slug: 'test-test',
            },
            token: "kdfjkfjskafjsdlfslfjsfkdsjkfjsdlkj",
        },
        "Workspace created successfully",
        201
    )
}