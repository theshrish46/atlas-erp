import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}

export interface AccessTokenPayload extends JWTPayload {
    userId: string;
    companyId: string;
    sessionId: string;
}

export async function signAccessToken(
    payload: AccessTokenPayload,
): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export async function verifyAccessToken(
    token: string,
): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, secret);

    return payload as AccessTokenPayload;
}