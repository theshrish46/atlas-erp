"use client";

import { useEffect, useMemo, useState } from "react";
import {
    MoreHorizontal,
    Plus,
    Search,
    UserPlus,
    Users,
} from "lucide-react";

import { apiGet, apiPost } from "@/lib/api/client";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Employee = {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type EmployeesResponse = {
    employees: Employee[];
};

type CreateEmployeeResponse = {
    employee: Employee;
};

type CreateEmployeePayload = {
    fullName: string;
    email: string;
    password: string;
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function loadEmployees() {
        try {
            setLoading(true);
            setError(null);

            const response = await apiGet<EmployeesResponse>(
                "/api/settings/employees",
            );

            setEmployees(response.employees ?? []);
        } catch (error) {
            console.error("Failed to load employees:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load employees.",
            );

            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadEmployees();
    }, []);

    const filteredEmployees = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return employees;
        }

        return employees.filter((employee) => {
            return (
                employee.fullName.toLowerCase().includes(query) ||
                employee.email.toLowerCase().includes(query)
            );
        });
    }, [employees, search]);

    function resetCreateForm() {
        setFullName("");
        setEmail("");
        setPassword("");
        setCreateError(null);
    }

    async function handleCreateEmployee() {
        if (!fullName.trim()) {
            setCreateError("Full name is required.");
            return;
        }

        if (!email.trim()) {
            setCreateError("Email address is required.");
            return;
        }

        if (!password) {
            setCreateError("Password is required.");
            return;
        }

        if (password.length < 8) {
            setCreateError("Password must be at least 8 characters.");
            return;
        }

        try {
            setCreating(true);
            setCreateError(null);

            const payload: CreateEmployeePayload = {
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
            };

            const response = await apiPost<
                CreateEmployeeResponse,
                CreateEmployeePayload
            >("/api/settings/employees", payload);

            if (response.employee) {
                setEmployees((current) => [
                    response.employee,
                    ...current,
                ]);
            } else {
                await loadEmployees();
            }

            resetCreateForm();
            setDialogOpen(false);
        } catch (error) {
            console.error("Failed to create employee:", error);

            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Failed to create employee.",
            );
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Employees
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Manage employees in your company workspace.
                    </p>
                </div>

                <Dialog
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        setDialogOpen(open);

                        if (!open) {
                            resetCreateForm();
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                Add Employee
                            </DialogTitle>

                            <DialogDescription>
                                Create an employee account for your
                                company.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="employee-full-name">
                                    Full Name
                                </Label>

                                <Input
                                    id="employee-full-name"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(event) =>
                                        setFullName(event.target.value)
                                    }
                                    disabled={creating}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employee-email">
                                    Email Address
                                </Label>

                                <Input
                                    id="employee-email"
                                    type="email"
                                    placeholder="john@company.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    disabled={creating}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employee-password">
                                    Temporary Password
                                </Label>

                                <Input
                                    id="employee-password"
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    disabled={creating}
                                />

                                <p className="text-xs text-muted-foreground">
                                    The employee can change their password
                                    after signing in.
                                </p>
                            </div>

                            {createError && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {createError}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={creating}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={handleCreateEmployee}
                                disabled={creating}
                            >
                                {creating ? (
                                    "Creating..."
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Create Employee
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Employee count */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Employees
                        </CardTitle>

                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {employees.length}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Employees in this workspace
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Employees
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {
                                employees.filter(
                                    (employee) => employee.isActive,
                                ).length
                            }
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Currently active accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Inactive Employees
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {
                                employees.filter(
                                    (employee) => !employee.isActive,
                                ).length
                            }
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Disabled employee accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Employee list */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Employee Directory</CardTitle>

                            <CardDescription>
                                View and manage employees belonging to
                                this workspace.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                placeholder="Search employees..."
                                className="pl-9"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex min-h-[250px] items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                                Loading employees...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <p className="text-sm text-destructive">
                                {error}
                            </p>

                            <Button
                                variant="outline"
                                onClick={() => void loadEmployees()}
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    {search
                                        ? "No employees found"
                                        : "No employees yet"}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search
                                        ? "Try a different search term."
                                        : "Add your first employee to get started."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredEmployees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between gap-4 px-6 py-4"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            {employee.fullName
                                                .trim()
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {employee.fullName}
                                            </p>

                                            <p className="truncate text-sm text-muted-foreground">
                                                {employee.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <Badge
                                            variant={
                                                employee.isActive
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {employee.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                asChild
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Employee actions
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    View Profile
                                                </DropdownMenuItem>

                                                <DropdownMenuItem>
                                                    Edit Employee
                                                </DropdownMenuItem>

                                                <DropdownMenuItem>
                                                    Manage Roles
                                                </DropdownMenuItem>

                                                <DropdownMenuItem>
                                                    Manage Departments
                                                </DropdownMenuItem>

                                                <DropdownMenuItem>
                                                    {employee.isActive
                                                        ? "Deactivate Employee"
                                                        : "Activate Employee"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}