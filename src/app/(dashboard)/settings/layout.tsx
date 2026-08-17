import Link from "next/link";
import { ArrowLeft, Building2, Users, ShieldCheck, Mail } from "lucide-react";

export default function SettingsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="space-y-6">
            {/* Settings Header */}

            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Settings
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage your workspace and organization.
                    </p>
                </div>
            </div>

            {/* Settings Navigation */}

            <div className="flex flex-wrap gap-2 border-b pb-4">
                <Link
                    href="/settings"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    Overview
                </Link>

                <Link
                    href="/settings/employees"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Users className="h-4 w-4" />
                    Employees
                </Link>

                <Link
                    href="/settings/departments"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Building2 className="h-4 w-4" />
                    Departments
                </Link>

                <Link
                    href="/settings/roles"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <ShieldCheck className="h-4 w-4" />
                    Roles
                </Link>

                <Link
                    href="/settings/invitations"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Mail className="h-4 w-4" />
                    Invitations
                </Link>
            </div>

            {/* Current Settings Page */}

            <div>
                {children}
            </div>
        </div>
    );
}