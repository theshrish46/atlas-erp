"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, ArrowRight } from "lucide-react";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const token =
            localStorage.getItem("authToken") ||
            localStorage.getItem("accessToken");

        setIsLoggedIn(Boolean(token));
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Building2 className="h-5 w-5" />
                    </div>

                    <span className="text-lg font-bold tracking-tight">
                        Atlas ERP
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
                    <a
                        href="#features"
                        className="transition-colors hover:text-foreground"
                    >
                        Features
                    </a>

                    <a
                        href="#how-it-works"
                        className="transition-colors hover:text-foreground"
                    >
                        How it works
                    </a>

                    <a
                        href="#security"
                        className="transition-colors hover:text-foreground"
                    >
                        Security
                    </a>
                </nav>

                {/* Authentication Actions */}
                <div className="flex items-center gap-3">
                    {mounted && isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
                        >
                            Go to ERP

                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="hidden rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}