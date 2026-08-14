"use client";

import { useState } from "react";
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
import { apiPost } from "@/lib/api/client";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        companyName: "",
        website: "",
        country: "India",
        state: "",
        city: "",
        timezone: "Asia/Kolkata",
        fullName: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange =
        (field: keyof typeof formData) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                }));
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await apiPost("/auth/register", formData);

            console.log("Registration successful:", result);

            // TODO: redirect to dashboard or login
        } catch (error: any) {
            console.error("Registration error:", error);
        } finally {
            setLoading(false);
        }
    };

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
                        Register your company and create the administrator account
                        for your Atlas ERP workspace.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Company Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Company Information
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="companyName">
                                Company Name
                            </Label>

                            <Input
                                id="companyName"
                                placeholder="Acme Technologies Pvt Ltd"
                                autoComplete="organization"
                                value={formData.companyName}
                                onChange={handleChange("companyName")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">
                                Website (Optional)
                            </Label>

                            <Input
                                id="website"
                                placeholder="https://acme.com"
                                autoComplete="url"
                                value={formData.website}
                                onChange={handleChange("website")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">
                                    Country
                                </Label>

                                <Input
                                    id="country"
                                    placeholder="India"
                                    value={formData.country}
                                    onChange={handleChange("country")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">
                                    State
                                </Label>

                                <Input
                                    id="state"
                                    placeholder="Karnataka"
                                    value={formData.state}
                                    onChange={handleChange("state")}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">
                                    City
                                </Label>

                                <Input
                                    id="city"
                                    placeholder="Bengaluru"
                                    value={formData.city}
                                    onChange={handleChange("city")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">
                                    Timezone
                                </Label>

                                <Input
                                    id="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange("timezone")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Administrator Account */}
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold">
                            Administrator Account
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">
                                Full Name
                            </Label>

                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                autoComplete="name"
                                value={formData.fullName}
                                onChange={handleChange("fullName")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email Address
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="john@company.com"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange("email")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a strong password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange("password")}
                            />

                            <p className="text-xs text-muted-foreground">
                                Minimum 8 characters.
                            </p>
                        </div>
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
                        type="submit"
                        className="h-11 w-full text-base"
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? "Creating Company..." : "Create Company"}

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
