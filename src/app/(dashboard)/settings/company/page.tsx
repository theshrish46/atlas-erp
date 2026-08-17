"use client";

import { Building2, Save } from "lucide-react";

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

export default function CompanySettingsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Company Settings
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Manage your company's basic information and workspace
                    details.
                </p>
            </div>

            {/* Company Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                        </div>

                        <div>
                            <CardTitle>Company Information</CardTitle>

                            <CardDescription>
                                Update the information associated with your
                                Atlas ERP workspace.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <form className="space-y-6">
                        {/* Company Name */}
                        <div className="space-y-2">
                            <Label htmlFor="companyName">
                                Company Name
                            </Label>

                            <Input
                                id="companyName"
                                placeholder="Acme Technologies Pvt Ltd"
                            />
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label htmlFor="website">
                                Website
                            </Label>

                            <Input
                                id="website"
                                type="url"
                                placeholder="https://example.com"
                            />
                        </div>

                        {/* GST / PAN */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="gstNumber">
                                    GST Number
                                </Label>

                                <Input
                                    id="gstNumber"
                                    placeholder="GST number"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="panNumber">
                                    PAN Number
                                </Label>

                                <Input
                                    id="panNumber"
                                    placeholder="PAN number"
                                />
                            </div>
                        </div>

                        {/* Country / State */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="country">
                                    Country
                                </Label>

                                <Input
                                    id="country"
                                    placeholder="India"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">
                                    State
                                </Label>

                                <Input
                                    id="state"
                                    placeholder="Karnataka"
                                />
                            </div>
                        </div>

                        {/* City / Postal Code */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="city">
                                    City
                                </Label>

                                <Input
                                    id="city"
                                    placeholder="Bengaluru"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postalCode">
                                    Postal Code
                                </Label>

                                <Input
                                    id="postalCode"
                                    placeholder="560001"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">
                                Address
                            </Label>

                            <textarea
                                id="address"
                                placeholder="Company address"
                                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        {/* Timezone */}
                        <div className="space-y-2">
                            <Label htmlFor="timezone">
                                Timezone
                            </Label>

                            <Input
                                id="timezone"
                                placeholder="Asia/Kolkata"
                            />

                            <p className="text-xs text-muted-foreground">
                                Used for dates, times, reports and business
                                transactions throughout Atlas ERP.
                            </p>
                        </div>

                        {/* Save */}
                        <div className="flex justify-end border-t pt-6">
                            <Button type="submit" className="gap-2">
                                <Save className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Workspace Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Workspace Status</CardTitle>

                    <CardDescription>
                        Information about the current state of your company
                        workspace.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">
                                Workspace Status
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Your company workspace is currently active.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            Active
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}