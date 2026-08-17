import Link from "next/link";
import {
    ArrowRight,
    Building2,
    BriefcaseBusiness,
    KeyRound,
    ShieldCheck,
    Users,
} from "lucide-react";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const settingsSections = [
    {
        title: "Employees",
        description:
            "Add employees, manage employee accounts, departments and access.",
        href: "/settings/employees",
        icon: Users,
    },
    {
        title: "Roles & Permissions",
        description:
            "Create roles and control which permissions are assigned to them.",
        href: "/settings/roles",
        icon: ShieldCheck,
    },
    {
        title: "Departments",
        description:
            "Create and manage departments within your company.",
        href: "/settings/departments",
        icon: BriefcaseBusiness,
    },
    {
        title: "Company",
        description:
            "Manage your company information and workspace preferences.",
        href: "/settings/company",
        icon: Building2,
    },
    {
        title: "Security",
        description:
            "Manage authentication, sessions and account security settings.",
        href: "/settings/security",
        icon: KeyRound,
    },
];

export default function SettingsPage() {
    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Settings
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Manage your company, employees, access and workspace settings.
                </p>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {settingsSections.map((section) => {
                    const Icon = section.icon;

                    return (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="group"
                        >
                            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                                <CardHeader>
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                    </div>

                                    <CardTitle className="text-lg">
                                        {section.title}
                                    </CardTitle>

                                    <CardDescription className="leading-6">
                                        {section.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}