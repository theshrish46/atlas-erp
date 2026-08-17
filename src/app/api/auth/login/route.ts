import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
    users,
    companies,
    employees,
    roles,
    employeeRoles,
    sessions,
    auditLogs,
} from "@/lib/db/schema/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/hash";
import { signAccessToken } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validators/auth.validators";
import {
    successResponse,
    errorResponse,
} from "@/lib/utils/api-response";
import { createHash } from "crypto";

function hashToken(token: string): string {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                "Validation failed",
                "VALIDATION_ERROR",
                400,
                parsed.error.flatten(),
            );
        }

        const {
            email,
            password,
        } = parsed.data;

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        /*
         * Find user
         */
        const user = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        });

        /*
         * Don't reveal whether the email exists.
         */
        if (!user) {
            return errorResponse(
                "Invalid email or password",
                "INVALID_CREDENTIALS",
                401,
            );
        }

        /*
         * Check account status
         */
        if (!user.isActive) {
            return errorResponse(
                "Your account has been disabled",
                "ACCOUNT_DISABLED",
                403,
            );
        }

        /*
         * Password must exist for normal password login.
         */
        if (!user.passwordHash) {
            return errorResponse(
                "This account cannot be signed in with a password",
                "PASSWORD_LOGIN_UNAVAILABLE",
                403,
            );
        }

        /*
         * Verify password
         */
        const passwordValid = await verifyPassword(
            password,
            user.passwordHash,
        );

        if (!passwordValid) {
            return errorResponse(
                "Invalid email or password",
                "INVALID_CREDENTIALS",
                401,
            );
        }

        /*
         * Find employee record.
         *
         * The employee connects the user to a company.
         */
        const employeeRecord = await db.query.employees.findFirst({
            where: eq(employees.userId, user.id),
        });

        if (!employeeRecord) {
            return errorResponse(
                "Your account is not associated with a company",
                "EMPLOYEE_NOT_FOUND",
                403,
            );
        }

        /*
         * Make sure the company still exists and is active.
         */
        const company = await db.query.companies.findFirst({
            where: and(
                eq(companies.id, employeeRecord.companyId),
                eq(companies.isActive, true),
            ),
        });

        if (!company) {
            return errorResponse(
                "This company workspace is inactive",
                "COMPANY_INACTIVE",
                403,
            );
        }

        /*
         * Get the employee's roles.
         */
        const employeeRoleRecords =
            await db.query.employeeRoles.findMany({
                where: eq(
                    employeeRoles.employeeId,
                    employeeRecord.id,
                ),
            });

        /*
         * Resolve role details.
         */
        const userRoles = [];

        for (const employeeRole of employeeRoleRecords) {
            const role = await db.query.roles.findFirst({
                where: and(
                    eq(roles.id, employeeRole.roleId),
                    eq(roles.companyId, company.id),
                ),
            });

            if (role) {
                userRoles.push(role);
            }
        }

        /*
         * A user without a role should not be allowed
         * into the ERP workspace.
         */
        if (userRoles.length === 0) {
            return errorResponse(
                "Your account does not have an assigned role",
                "ROLE_NOT_ASSIGNED",
                403,
            );
        }

        /*
         * Create the session first.
         *
         * The JWT contains this session ID.
         */
        const expiresAt = new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000,
        );

        const result = await db.transaction(async (tx) => {
            /*
             * Create a temporary session row.
             *
             * We need the session ID before signing the JWT.
             */
            const [session] = await tx
                .insert(sessions)
                .values({
                    userId: user.id,
                    tokenHash: "pending",
                    expiresAt,
                    ipAddress:
                        req.headers.get("x-forwarded-for") ??
                        req.headers.get("x-real-ip"),
                    userAgent:
                        req.headers.get("user-agent"),
                })
                .returning();

            if (!session) {
                throw new Error(
                    "Failed to create authentication session",
                );
            }

            /*
             * Create JWT containing the session ID.
             */
            const token = await signAccessToken({
                userId: user.id,
                companyId: company.id,
                sessionId: session.id,
            });

            /*
             * Store only a hash of the JWT.
             */
            const tokenHash = hashToken(token);

            await tx
                .update(sessions)
                .set({
                    tokenHash,
                })
                .where(eq(sessions.id, session.id));

            /*
             * Record successful login.
             */
            await tx.insert(auditLogs).values({
                companyId: company.id,
                userId: user.id,
                action: "user.logged_in",
                entityType: "user",
                entityId: user.id,
                metadata: {
                    email: user.email,
                    sessionId: session.id,
                },
            });

            return {
                session,
                token,
            };
        });

        return successResponse(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: employeeRecord.fullName,
                },

                company: {
                    id: company.id,
                    name: company.name,
                    slug: company.slug,
                },

                roles: userRoles.map((role) => ({
                    id: role.id,
                    name: role.name,
                })),

                token: result.token,
            },
            "Login successful",
            200,
        );
    } catch (error) {
        console.error(
            "Login error:",
            error,
        );

        return errorResponse(
            "Something went wrong while signing you in",
            "LOGIN_FAILED",
            500,
        );
    }
}