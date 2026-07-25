import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/dashboard"];

export function proxy(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;

    const { pathname } = request.nextUrl;

    // Root
    if (pathname === "/") {
        return NextResponse.redirect(
            new URL(token ? "/dashboard" : "/login", request.url)
        );
    }

    // Logged in user visiting login/register
    if (token && AUTH_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Guest visiting protected routes
    if (
        !token &&
        PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
    ) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/login",
        "/register",
        "/dashboard/:path*",
    ],
};