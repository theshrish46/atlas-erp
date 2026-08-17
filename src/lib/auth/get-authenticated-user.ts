import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function getAuthenticatedUser(
    req: NextRequest,
) {
    const authorization =
        req.headers.get("authorization");

    if (!authorization) {
        return null;
    }

    if (!authorization.startsWith("Bearer ")) {
        return null;
    }

    const token = authorization.substring(7).trim();

    if (!token) {
        return null;
    }

    try {
        const payload =
            await verifyAccessToken(token);

        return {
            userId: payload.userId,
            companyId: payload.companyId,
            sessionId: payload.sessionId,
        };
    } catch (error) {
        console.error(
            "Authentication verification failed:",
            error,
        );

        return null;
    }
}