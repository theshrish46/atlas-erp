import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;

    const { pathname } = request.nextUrl;

    const authRoutes = ["/login", "/register"];

    const protectedRoutes = ["/dashboard"];

    // User is logged in and tries to visit login/register
    if (token && authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // User is not logged in and tries to visit protected routes
    if (
        !token &&
        protectedRoutes.some((route) => pathname.startsWith(route))
    ) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Root Route
    if (pathname === "/") {
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

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