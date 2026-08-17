"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Check,
    ChevronDown,
    Loader2,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    UserPlus,
    Users,
    X,
} from "lucide-react";

import {
    apiGet,
    apiPost,
    apiPut,
} from "@/lib/api/client";

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
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Role = {
    id: string;
    name: string;
    description?: string | null;
};

type Department = {
    id: string;
    name: string;
};

type Employee = {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    role?: Role | null;

    departments?: Department[];
};

type EmployeesResponse = {
    employees: Employee[];
};

type EmployeeResponse = {
    employee: Employee;
};

type EmployeeOptionsResponse = {
    roles: Role[];
    departments: Department[];
};

type CreateEmployeePayload = {
    fullName: string;
    email: string;
    password: string;
    roleId?: string | null;
    departmentIds?: string[];
};

type UpdateEmployeePayload = {
    fullName: string;
    roleId?: string | null;
    departmentIds: string[];
    isActive: boolean;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function EmployeesPage() {
    /* ---------------------------------------------------------------------- */
    /* Data                                                                   */
    /* ---------------------------------------------------------------------- */

    const [employees, setEmployees] = useState<Employee[]>([]);

    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] =
        useState<Department[]>([]);

    /* ---------------------------------------------------------------------- */
    /* UI state                                                               */
    /* ---------------------------------------------------------------------- */

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] =
        useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] =
        useState(false);

    const [selectedEmployee, setSelectedEmployee] =
        useState<Employee | null>(null);

    /* ---------------------------------------------------------------------- */
    /* Create state                                                           */
    /* ---------------------------------------------------------------------- */

    const [creating, setCreating] = useState(false);

    const [createError, setCreateError] =
        useState<string | null>(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [createRoleId, setCreateRoleId] =
        useState<string>("");

    const [createDepartmentIds, setCreateDepartmentIds] =
        useState<string[]>([]);

    /* ---------------------------------------------------------------------- */
    /* Edit state                                                             */
    /* ---------------------------------------------------------------------- */

    const [editing, setEditing] = useState(false);

    const [editError, setEditError] =
        useState<string | null>(null);

    const [editFullName, setEditFullName] =
        useState("");

    const [editRoleId, setEditRoleId] =
        useState<string>("");

    const [editDepartmentIds, setEditDepartmentIds] =
        useState<string[]>([]);

    const [editIsActive, setEditIsActive] =
        useState(true);

    /* ---------------------------------------------------------------------- */
    /* Load employees                                                         */
    /* ---------------------------------------------------------------------- */

    async function loadEmployees(
        showRefreshState = false,
    ) {
        try {
            if (showRefreshState) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(null);

            const response =
                await apiGet<EmployeesResponse>(
                    "/api/settings/employees",
                );

            setEmployees(response.employees ?? []);
        } catch (error) {
            console.error(
                "Failed to load employees:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load employees.",
            );

            setEmployees([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Load roles + departments                                               */
    /* ---------------------------------------------------------------------- */

    async function loadOptions() {
        try {
            const response =
                await apiGet<EmployeeOptionsResponse>(
                    "/api/settings/employees/options",
                );

            setRoles(response.roles ?? []);
            setDepartments(
                response.departments ?? [],
            );
        } catch (error) {
            console.error(
                "Failed to load employee options:",
                error,
            );
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Initial load                                                           */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        void Promise.all([
            loadEmployees(),
            loadOptions(),
        ]);
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Search                                                                 */
    /* ---------------------------------------------------------------------- */

    const filteredEmployees = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return employees;
        }

        return employees.filter((employee) => {
            const departmentNames =
                employee.departments
                    ?.map(
                        (department) =>
                            department.name,
                    )
                    .join(" ")
                    .toLowerCase() ?? "";

            const roleName =
                employee.role?.name
                    ?.toLowerCase() ?? "";

            return (
                employee.fullName
                    .toLowerCase()
                    .includes(query) ||
                employee.email
                    .toLowerCase()
                    .includes(query) ||
                departmentNames.includes(query) ||
                roleName.includes(query)
            );
        });
    }, [employees, search]);

    /* ---------------------------------------------------------------------- */
    /* Statistics                                                             */
    /* ---------------------------------------------------------------------- */

    const activeEmployees = useMemo(() => {
        return employees.filter(
            (employee) => employee.isActive,
        ).length;
    }, [employees]);

    const inactiveEmployees = useMemo(() => {
        return employees.filter(
            (employee) => !employee.isActive,
        ).length;
    }, [employees]);

    /* ---------------------------------------------------------------------- */
    /* Create form                                                            */
    /* ---------------------------------------------------------------------- */

    function resetCreateForm() {
        setFullName("");
        setEmail("");
        setPassword("");
        setCreateRoleId("");
        setCreateDepartmentIds([]);
        setCreateError(null);
    }

    function toggleCreateDepartment(
        departmentId: string,
    ) {
        setCreateDepartmentIds((current) => {
            if (current.includes(departmentId)) {
                return current.filter(
                    (id) => id !== departmentId,
                );
            }

            return [
                ...current,
                departmentId,
            ];
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Create employee                                                        */
    /* ---------------------------------------------------------------------- */

    async function handleCreateEmployee() {
        if (!fullName.trim()) {
            setCreateError(
                "Full name is required.",
            );
            return;
        }

        if (!email.trim()) {
            setCreateError(
                "Email address is required.",
            );
            return;
        }

        if (!password) {
            setCreateError(
                "Temporary password is required.",
            );
            return;
        }

        if (password.length < 8) {
            setCreateError(
                "Password must be at least 8 characters.",
            );
            return;
        }

        try {
            setCreating(true);
            setCreateError(null);

            const payload: CreateEmployeePayload = {
                fullName: fullName.trim(),
                email: email
                    .trim()
                    .toLowerCase(),
                password,
                roleId:
                    createRoleId || null,
                departmentIds:
                    createDepartmentIds,
            };

            const response =
                await apiPost<
                    EmployeeResponse,
                    CreateEmployeePayload
                >(
                    "/api/settings/employees",
                    payload,
                );

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
            console.error(
                "Failed to create employee:",
                error,
            );

            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Failed to create employee.",
            );
        } finally {
            setCreating(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Open edit dialog                                                       */
    /* ---------------------------------------------------------------------- */

    function openEditDialog(
        employee: Employee,
    ) {
        setSelectedEmployee(employee);

        setEditFullName(
            employee.fullName,
        );

        setEditRoleId(
            employee.role?.id ?? "",
        );

        setEditDepartmentIds(
            employee.departments?.map(
                (department) =>
                    department.id,
            ) ?? [],
        );

        setEditIsActive(
            employee.isActive,
        );

        setEditError(null);

        setEditDialogOpen(true);
    }

    /* ---------------------------------------------------------------------- */
    /* Toggle edit department                                                 */
    /* ---------------------------------------------------------------------- */

    function toggleEditDepartment(
        departmentId: string,
    ) {
        setEditDepartmentIds((current) => {
            if (current.includes(departmentId)) {
                return current.filter(
                    (id) => id !== departmentId,
                );
            }

            return [
                ...current,
                departmentId,
            ];
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Save employee                                                          */
    /* ---------------------------------------------------------------------- */

    async function handleUpdateEmployee() {
        if (!selectedEmployee) {
            return;
        }

        if (!editFullName.trim()) {
            setEditError(
                "Full name is required.",
            );
            return;
        }

        try {
            setEditing(true);
            setEditError(null);

            const payload: UpdateEmployeePayload =
            {
                fullName:
                    editFullName.trim(),

                roleId:
                    editRoleId || null,

                departmentIds:
                    editDepartmentIds,

                isActive:
                    editIsActive,
            };

            const response =
                await apiPut<
                    EmployeeResponse,
                    UpdateEmployeePayload
                >(
                    `/api/settings/employees/${selectedEmployee.id}`,
                    payload,
                );

            if (response.employee) {
                setEmployees((current) =>
                    current.map(
                        (employee) =>
                            employee.id ===
                                selectedEmployee.id
                                ? response.employee
                                : employee,
                    ),
                );

                setSelectedEmployee(
                    response.employee,
                );
            } else {
                await loadEmployees();
            }

            setEditDialogOpen(false);
        } catch (error) {
            console.error(
                "Failed to update employee:",
                error,
            );

            setEditError(
                error instanceof Error
                    ? error.message
                    : "Failed to update employee.",
            );
        } finally {
            setEditing(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Details                                                                */
    /* ---------------------------------------------------------------------- */

    function openDetailsDialog(
        employee: Employee,
    ) {
        setSelectedEmployee(employee);
        setDetailsDialogOpen(true);
    }

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="space-y-6">

            {/* -------------------------------------------------------------- */}
            {/* Header                                                         */}
            {/* -------------------------------------------------------------- */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Employees
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Manage employees, roles,
                        departments, and account status.
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    <Button
                        variant="outline"
                        onClick={() =>
                            void Promise.all([
                                loadEmployees(true),
                                loadOptions(),
                            ])
                        }
                        disabled={refreshing}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${refreshing
                                    ? "animate-spin"
                                    : ""
                                }`}
                        />

                        Refresh
                    </Button>

                    <Button
                        onClick={() => {
                            resetCreateForm();
                            setDialogOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Statistics                                                     */}
            {/* -------------------------------------------------------------- */}

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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Employees
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activeEmployees}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Currently active accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Inactive Employees
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {inactiveEmployees}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Disabled accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Employee directory                                             */}
            {/* -------------------------------------------------------------- */}

            <Card>

                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <CardTitle>
                                Employee Directory
                            </CardTitle>

                            <CardDescription>
                                View employees and manage
                                their roles and departments.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search employees..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-0">

                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">

                            <p className="text-sm text-destructive">
                                {error}
                            </p>

                            <Button
                                variant="outline"
                                onClick={() =>
                                    void loadEmployees()
                                }
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : filteredEmployees.length ===
                        0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">

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
                                        ? "Try another search term."
                                        : "Add your first employee to get started."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">

                            {filteredEmployees.map(
                                (employee) => (
                                    <div
                                        key={
                                            employee.id
                                        }
                                        className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >

                                        <div className="flex min-w-0 items-center gap-4">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                {employee.fullName
                                                    .trim()
                                                    .charAt(
                                                        0,
                                                    )
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">

                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-medium">
                                                        {
                                                            employee.fullName
                                                        }
                                                    </p>

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
                                                </div>

                                                <p className="truncate text-sm text-muted-foreground">
                                                    {
                                                        employee.email
                                                    }
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-1.5">

                                                    {employee.role ? (
                                                        <Badge variant="outline">
                                                            {
                                                                employee
                                                                    .role
                                                                    .name
                                                            }
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            No role
                                                        </Badge>
                                                    )}

                                                    {employee.departments
                                                        ?.length ? (
                                                        employee.departments.map(
                                                            (
                                                                department,
                                                            ) => (
                                                                <Badge
                                                                    key={
                                                                        department.id
                                                                    }
                                                                    variant="secondary"
                                                                >
                                                                    {
                                                                        department.name
                                                                    }
                                                                </Badge>
                                                            ),
                                                        )
                                                    ) : (
                                                        <Badge variant="outline">
                                                            No department
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

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

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openDetailsDialog(
                                                            employee,
                                                        )
                                                    }
                                                >
                                                    View Profile
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEditDialog(
                                                            employee,
                                                        )
                                                    }
                                                >
                                                    Edit Employee
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEditDialog(
                                                            employee,
                                                        )
                                                    }
                                                >
                                                    Manage Role & Departments
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem>
                                                    {employee.isActive
                                                        ? "Deactivate Employee"
                                                        : "Activate Employee"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ==============================================================
                CREATE EMPLOYEE
            ============================================================== */}

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);

                    if (!open) {
                        resetCreateForm();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">

                    <DialogHeader>
                        <DialogTitle>
                            Add Employee
                        </DialogTitle>

                        <DialogDescription>
                            Create an employee account
                            and assign their role and
                            departments.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">

                        {/* Basic information */}

                        <div className="space-y-4">

                            <h3 className="font-semibold">
                                Account Information
                            </h3>

                            <div className="space-y-2">
                                <Label>
                                    Full Name
                                </Label>

                                <Input
                                    placeholder="John Doe"
                                    value={
                                        fullName
                                    }
                                    onChange={(event) =>
                                        setFullName(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    disabled={
                                        creating
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Email Address
                                </Label>

                                <Input
                                    type="email"
                                    placeholder="john@company.com"
                                    value={
                                        email
                                    }
                                    onChange={(event) =>
                                        setEmail(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    disabled={
                                        creating
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Temporary Password
                                </Label>

                                <Input
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={
                                        password
                                    }
                                    onChange={(event) =>
                                        setPassword(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    disabled={
                                        creating
                                    }
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Role */}

                        <div className="space-y-3">

                            <div>
                                <h3 className="font-semibold">
                                    Role
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Determines what this
                                    employee can access.
                                </p>
                            </div>

                            <select
                                value={
                                    createRoleId
                                }
                                onChange={(event) =>
                                    setCreateRoleId(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    creating
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">
                                    No role
                                </option>

                                {roles.map(
                                    (role) => (
                                        <option
                                            key={
                                                role.id
                                            }
                                            value={
                                                role.id
                                            }
                                        >
                                            {
                                                role.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <Separator />

                        {/* Departments */}

                        <div className="space-y-3">

                            <div>
                                <h3 className="font-semibold">
                                    Departments
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    An employee can belong
                                    to multiple departments.
                                </p>
                            </div>

                            {departments.length ===
                                0 ? (
                                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                    No departments available.
                                </div>
                            ) : (
                                <div className="space-y-2">

                                    {departments.map(
                                        (
                                            department,
                                        ) => {
                                            const checked =
                                                createDepartmentIds.includes(
                                                    department.id,
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={
                                                        department.id
                                                    }
                                                    onClick={() =>
                                                        toggleCreateDepartment(
                                                            department.id,
                                                        )
                                                    }
                                                    disabled={
                                                        creating
                                                    }
                                                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition hover:bg-muted"
                                                >

                                                    <span className="text-sm font-medium">
                                                        {
                                                            department.name
                                                        }
                                                    </span>

                                                    <div
                                                        className={`flex h-5 w-5 items-center justify-center rounded border ${checked
                                                                ? "border-primary bg-primary text-primary-foreground"
                                                                : "border-input"
                                                            }`}
                                                    >
                                                        {checked && (
                                                            <Check className="h-3.5 w-3.5" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>

                        {createError && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {
                                    createError
                                }
                            </div>
                        )}
                    </div>

                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() =>
                                setDialogOpen(
                                    false,
                                )
                            }
                            disabled={
                                creating
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() =>
                                void handleCreateEmployee()
                            }
                            disabled={
                                creating
                            }
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
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

            {/* ==============================================================
                EDIT EMPLOYEE
            ============================================================== */}

            <Dialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">

                    <DialogHeader>
                        <DialogTitle>
                            Edit Employee
                        </DialogTitle>

                        <DialogDescription>
                            Update employee information,
                            role, departments, and status.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">

                        <div className="space-y-2">
                            <Label>
                                Full Name
                            </Label>

                            <Input
                                value={
                                    editFullName
                                }
                                onChange={(event) =>
                                    setEditFullName(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    editing
                                }
                            />
                        </div>

                        {selectedEmployee && (
                            <div className="rounded-lg bg-muted/50 p-3 text-sm">
                                <span className="text-muted-foreground">
                                    Email:{" "}
                                </span>

                                {
                                    selectedEmployee.email
                                }
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-3">

                            <div>
                                <h3 className="font-semibold">
                                    Role
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Select the employee's
                                    access role.
                                </p>
                            </div>

                            <select
                                value={
                                    editRoleId
                                }
                                onChange={(event) =>
                                    setEditRoleId(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    editing
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">
                                    No role
                                </option>

                                {roles.map(
                                    (role) => (
                                        <option
                                            key={
                                                role.id
                                            }
                                            value={
                                                role.id
                                            }
                                        >
                                            {
                                                role.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <Separator />

                        <div className="space-y-3">

                            <div>
                                <h3 className="font-semibold">
                                    Departments
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Select all departments
                                    this employee belongs to.
                                </p>
                            </div>

                            <div className="space-y-2">

                                {departments.map(
                                    (
                                        department,
                                    ) => {
                                        const checked =
                                            editDepartmentIds.includes(
                                                department.id,
                                            );

                                        return (
                                            <button
                                                type="button"
                                                key={
                                                    department.id
                                                }
                                                onClick={() =>
                                                    toggleEditDepartment(
                                                        department.id,
                                                    )
                                                }
                                                disabled={
                                                    editing
                                                }
                                                className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition hover:bg-muted"
                                            >

                                                <span className="text-sm font-medium">
                                                    {
                                                        department.name
                                                    }
                                                </span>

                                                <div
                                                    className={`flex h-5 w-5 items-center justify-center rounded border ${checked
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-input"
                                                        }`}
                                                >
                                                    {checked && (
                                                        <Check className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between rounded-lg border p-4">

                            <div>
                                <p className="font-medium">
                                    Account Status
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    Allow this employee
                                    to sign in.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant={
                                    editIsActive
                                        ? "default"
                                        : "secondary"
                                }
                                onClick={() =>
                                    setEditIsActive(
                                        (
                                            current,
                                        ) =>
                                            !current,
                                    )
                                }
                                disabled={
                                    editing
                                }
                            >
                                {editIsActive
                                    ? "Active"
                                    : "Inactive"}
                            </Button>
                        </div>

                        {editError && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {
                                    editError
                                }
                            </div>
                        )}
                    </div>

                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() =>
                                setEditDialogOpen(
                                    false,
                                )
                            }
                            disabled={
                                editing
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() =>
                                void handleUpdateEmployee()
                            }
                            disabled={
                                editing
                            }
                        >
                            {editing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==============================================================
                EMPLOYEE DETAILS
            ============================================================== */}

            <Dialog
                open={detailsDialogOpen}
                onOpenChange={
                    setDetailsDialogOpen
                }
            >
                <DialogContent className="sm:max-w-[600px]">

                    <DialogHeader>
                        <DialogTitle>
                            Employee Profile
                        </DialogTitle>

                        <DialogDescription>
                            Employee account and
                            organizational information.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEmployee && (
                        <div className="space-y-6 py-4">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                                    {selectedEmployee.fullName
                                        .trim()
                                        .charAt(
                                            0,
                                        )
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">

                                        <h3 className="font-semibold">
                                            {
                                                selectedEmployee.fullName
                                            }
                                        </h3>

                                        <Badge
                                            variant={
                                                selectedEmployee.isActive
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {selectedEmployee.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {
                                            selectedEmployee.email
                                        }
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Role
                                    </p>

                                    <div className="mt-2">

                                        {selectedEmployee.role ? (
                                            <Badge variant="outline">
                                                {
                                                    selectedEmployee
                                                        .role
                                                        .name
                                                }
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                No role assigned
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Departments
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-2">

                                        {selectedEmployee.departments
                                            ?.length ? (
                                            selectedEmployee.departments.map(
                                                (
                                                    department,
                                                ) => (
                                                    <Badge
                                                        key={
                                                            department.id
                                                        }
                                                        variant="secondary"
                                                    >
                                                        {
                                                            department.name
                                                        }
                                                    </Badge>
                                                ),
                                            )
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                No departments assigned
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Created
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {new Date(
                                            selectedEmployee.createdAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() =>
                                setDetailsDialogOpen(
                                    false,
                                )
                            }
                        >
                            Close
                        </Button>

                        {selectedEmployee && (
                            <Button
                                onClick={() => {
                                    setDetailsDialogOpen(
                                        false,
                                    );

                                    openEditDialog(
                                        selectedEmployee,
                                    );
                                }}
                            >
                                Edit Employee
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}