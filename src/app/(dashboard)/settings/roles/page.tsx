"use client";

import {
    Plus,
    Shield,
    MoreHorizontal,
    Users,
    LockKeyhole,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const roles = [
    {
        id: "1",
        name: "Admin",
        description: "Full administrative access to the workspace.",
        employees: 1,
        system: true,
        permissions: "All permissions",
    },
    {
        id: "2",
        name: "Manager",
        description: "Manage departments, employees and assigned business operations.",
        employees: 0,
        system: true,
        permissions: "Custom permissions",
    },
    {
        id: "3",
        name: "Employee",
        description: "Standard employee access to assigned modules.",
        employees: 0,
        system: true,
        permissions: "Custom permissions",
    },
];

export default function RolesPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Roles & Permissions
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Manage roles and control what users can access in your
                        workspace.
                    </p>
                </div>

                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Role
                </Button>
            </div>

            {/* Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Shield className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Roles
                            </p>

                            <p className="text-2xl font-bold">
                                {roles.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Users className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Assigned Employees
                            </p>

                            <p className="text-2xl font-bold">
                                {roles.reduce(
                                    (total, role) => total + role.employees,
                                    0
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <LockKeyhole className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                System Roles
                            </p>

                            <p className="text-2xl font-bold">
                                {roles.filter((role) => role.system).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Roles */}
            <Card>
                <CardHeader>
                    <CardTitle>Workspace Roles</CardTitle>

                    <CardDescription>
                        Roles determine which parts of Atlas ERP users can
                        access and what actions they can perform.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="divide-y">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">
                                                {role.name}
                                            </h3>

                                            {role.system && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    System
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {role.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                                            <span>
                                                {role.employees}{" "}
                                                {role.employees === 1
                                                    ? "employee"
                                                    : "employees"}
                                            </span>

                                            <span>
                                                {role.permissions}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            View Permissions
                                        </DropdownMenuItem>

                                        <DropdownMenuItem>
                                            Manage Employees
                                        </DropdownMenuItem>

                                        {!role.system && (
                                            <>
                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem>
                                                    Edit Role
                                                </DropdownMenuItem>

                                                <DropdownMenuItem className="text-destructive">
                                                    Delete Role
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}