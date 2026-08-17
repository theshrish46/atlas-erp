"use client";

import { useState } from "react";
import {
    Building2,
    CalendarDays,
    Check,
    Mail,
    Pencil,
    ShieldCheck,
    User,
    X,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    const [fullName, setFullName] = useState("John Doe");
    const [email, setEmail] = useState("john@company.com");

    return (
        <div className="flex min-h-[calc(100vh-2rem)] items-start justify-center overflow-y-auto p-2 sm:p-4 lg:p-6">
            <Card className="w-full max-w-4xl overflow-hidden border-border/60 shadow-2xl">
                {/* Profile Header */}
                <div className="bg-muted/40 px-6 py-8 sm:px-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-5">
                            {/* Avatar */}
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                                {getInitials(fullName)}
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-bold tracking-tight">
                                    {fullName}
                                </h1>

                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                    {email}
                                </p>

                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Administrator
                                </div>
                            </div>
                        </div>

                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="sm:shrink-0"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                <CardContent className="p-6 sm:p-8">
                    {isEditing ? (
                        <EditProfile
                            fullName={fullName}
                            email={email}
                            setFullName={setFullName}
                            setEmail={setEmail}
                            onCancel={() => setIsEditing(false)}
                            onSave={() => setIsEditing(false)}
                        />
                    ) : (
                        <ProfileView
                            fullName={fullName}
                            email={email}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Profile View                                                               */
/* -------------------------------------------------------------------------- */

function ProfileView({
    fullName,
    email,
}: {
    fullName: string;
    email: string;
}) {
    return (
        <div className="space-y-8">
            {/* Personal Information */}
            <section>
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        Personal Information
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Your personal account information.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <ProfileItem
                        icon={User}
                        label="Full Name"
                        value={fullName}
                    />

                    <ProfileItem
                        icon={Mail}
                        label="Email Address"
                        value={email}
                    />
                </div>
            </section>

            <Separator />

            {/* Company Information */}
            <section>
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        Company
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Your current workspace information.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <ProfileItem
                        icon={Building2}
                        label="Company"
                        value="Acme Technologies Pvt Ltd"
                    />

                    <ProfileItem
                        icon={ShieldCheck}
                        label="Role"
                        value="Administrator"
                    />
                </div>
            </section>

            <Separator />

            {/* Account Information */}
            <section>
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        Account
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Information about your Atlas ERP account.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <ProfileItem
                        icon={CalendarDays}
                        label="Member Since"
                        value="August 2026"
                    />

                    <ProfileItem
                        icon={ShieldCheck}
                        label="Account Status"
                        value="Active"
                    />
                </div>
            </section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Edit Profile                                                               */
/* -------------------------------------------------------------------------- */

function EditProfile({
    fullName,
    email,
    setFullName,
    setEmail,
    onCancel,
    onSave,
}: {
    fullName: string;
    email: string;
    setFullName: (value: string) => void;
    setEmail: (value: string) => void;
    onCancel: () => void;
    onSave: () => void;
}) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold">
                    Edit Profile
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Update your personal account information.
                </p>
            </div>

            <Separator />

            <div className="grid gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="fullName">
                        Full Name
                    </Label>

                    <Input
                        id="fullName"
                        value={fullName}
                        onChange={(event) =>
                            setFullName(event.target.value)
                        }
                        placeholder="John Doe"
                        autoComplete="name"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">
                        Email Address
                    </Label>

                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="john@company.com"
                        autoComplete="email"
                    />

                    <p className="text-xs text-muted-foreground">
                        Changing your email may require verification.
                    </p>
                </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                    variant="outline"
                    onClick={onCancel}
                >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                </Button>

                <Button onClick={onSave}>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Profile Item                                                               */
/* -------------------------------------------------------------------------- */

function ProfileItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof User;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 truncate font-medium">
                    {value}
                </p>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}