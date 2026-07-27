"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    return (
        <Card className="border-border/60 shadow-2xl backdrop-blur">
            <CardHeader className="space-y-3 pb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Building2 className="h-7 w-7" />
                </div>

                <div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Welcome back
                    </CardTitle>

                    <CardDescription className="mt-2 text-base">
                        Sign in to access your company's Atlas ERP workspace.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <form className="space-y-6">
                    {/* Email */}

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Work Email
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            placeholder="john@company.com"
                            autoComplete="email"
                        />
                    </div>

                    {/* Password */}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">
                                Password
                            </Label>

                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Remember */}

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border"
                            />
                            <span className="text-muted-foreground">
                                Remember me
                            </span>
                        </label>
                    </div>

                    {/* Login */}

                    <Button
                        className="h-11 w-full text-base"
                        size="lg"
                    >
                        Sign In

                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {/* Divider */}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>

                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">
                                New to Atlas ERP?
                            </span>
                        </div>
                    </div>

                    {/* Register */}

                    <Button
                        asChild
                        variant="outline"
                        className="h-11 w-full"
                    >
                        <Link href="/register">
                            Create Company
                        </Link>
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}