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

export default function RegisterPage() {
    return (
        <Card className="border-border/60 shadow-2xl backdrop-blur">
            <CardHeader className="space-y-3 pb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Building2 className="h-7 w-7" />
                </div>

                <div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Create your workspace
                    </CardTitle>

                    <CardDescription className="mt-2 text-base">
                        Register your company and become the administrator of your
                        Atlas ERP workspace.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <form className="space-y-6">
                    {/* Company */}

                    <div className="space-y-2">
                        <Label htmlFor="company">
                            Company Name
                        </Label>

                        <Input
                            id="company"
                            placeholder="Acme Technologies Pvt Ltd"
                            autoComplete="organization"
                        />
                    </div>

                    {/* Name */}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                First Name
                            </Label>

                            <Input
                                id="firstName"
                                placeholder="John"
                                autoComplete="given-name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                Last Name
                            </Label>

                            <Input
                                id="lastName"
                                placeholder="Doe"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

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
                        <Label htmlFor="password">
                            Password
                        </Label>

                        <Input
                            id="password"
                            type="password"
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                        />

                        <p className="text-xs text-muted-foreground">
                            Minimum 8 characters.
                        </p>
                    </div>

                    {/* Terms */}

                    <p className="text-sm leading-6 text-muted-foreground">
                        By creating an account you agree to our{" "}
                        <Link
                            href="/terms"
                            className="font-medium text-primary hover:underline"
                        >
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="font-medium text-primary hover:underline"
                        >
                            Privacy Policy
                        </Link>.
                    </p>

                    {/* Button */}

                    <Button
                        className="h-11 w-full text-base"
                        size="lg"
                    >
                        Create Company

                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>

                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">
                                Already registered?
                            </span>
                        </div>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        className="h-11 w-full"
                    >
                        <Link href="/login">
                            Sign In
                        </Link>
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}