"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Users,
    Pencil,
    Trash2,
    Eye,
} from "lucide-react";

import {
    apiDelete,
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

type Department = {
    id: string;
    name: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    employeeCount?: number;
};

type DepartmentResponse = {
    departments?: Department[];
};

type CreateDepartmentResponse = {
    department: Department;
};

type UpdateDepartmentResponse = {
    department: Department;
};

type CreateDepartmentPayload = {
    name: string;
};

type UpdateDepartmentPayload = {
    name: string;
};

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [editingDepartment, setEditingDepartment] =
        useState<Department | null>(null);

    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);

    const [departmentToDelete, setDepartmentToDelete] =
        useState<Department | null>(null);

    const [departmentName, setDepartmentName] = useState("");

    const [formError, setFormError] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function loadDepartments(showRefreshState = false) {
        try {
            if (showRefreshState) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(null);

            const response = await apiGet<DepartmentResponse>(
                "/api/settings/departments",
            );

            setDepartments(response?.departments ?? []);
        } catch (error) {
            console.error(
                "Failed to load departments:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load departments.",
            );

            setDepartments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        void loadDepartments();
    }, []);

    const filteredDepartments = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return departments;
        }

        return departments.filter((department) =>
            department.name
                .toLowerCase()
                .includes(query),
        );
    }, [departments, search]);

    const totalEmployees = useMemo(() => {
        return departments.reduce(
            (total, department) =>
                total + (department.employeeCount ?? 0),
            0,
        );
    }, [departments]);

    function resetForm() {
        setDepartmentName("");
        setFormError(null);
        setEditingDepartment(null);
    }

    function openCreateDialog() {
        resetForm();
        setDialogOpen(true);
    }

    function openEditDialog(department: Department) {
        setEditingDepartment(department);
        setDepartmentName(department.name);
        setFormError(null);
        setDialogOpen(true);
    }

    function openDetailsDialog(department: Department) {
        setSelectedDepartment(department);
        setDetailsOpen(true);
    }

    function openDeleteDialog(department: Department) {
        setDepartmentToDelete(department);
        setDeleteOpen(true);
    }

    async function handleSaveDepartment() {
        const name = departmentName.trim();

        if (!name) {
            setFormError(
                "Department name is required.",
            );
            return;
        }

        if (name.length < 2) {
            setFormError(
                "Department name must contain at least 2 characters.",
            );
            return;
        }

        try {
            setSaving(true);
            setFormError(null);

            if (editingDepartment) {
                const payload: UpdateDepartmentPayload = {
                    name,
                };

                const response =
                    await apiPut<
                        UpdateDepartmentResponse,
                        UpdateDepartmentPayload
                    >(
                        `/api/settings/departments/${editingDepartment.id}`,
                        payload,
                    );

                if (response?.department) {
                    setDepartments((current) =>
                        current.map((department) =>
                            department.id ===
                                editingDepartment.id
                                ? {
                                    ...department,
                                    ...response.department,
                                }
                                : department,
                        ),
                    );
                } else {
                    await loadDepartments();
                }
            } else {
                const payload: CreateDepartmentPayload = {
                    name,
                };

                const response =
                    await apiPost<
                        CreateDepartmentResponse,
                        CreateDepartmentPayload
                    >(
                        "/api/settings/departments",
                        payload,
                    );

                if (response?.department) {
                    setDepartments((current) => [
                        response.department,
                        ...current,
                    ]);
                } else {
                    await loadDepartments();
                }
            }

            resetForm();
            setDialogOpen(false);
        } catch (error) {
            console.error(
                "Failed to save department:",
                error,
            );

            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to save department.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteDepartment() {
        if (!departmentToDelete) {
            return;
        }

        try {
            setDeleting(true);

            await apiDelete(
                `/api/settings/departments/${departmentToDelete.id}`,
            );

            setDepartments((current) =>
                current.filter(
                    (department) =>
                        department.id !==
                        departmentToDelete.id,
                ),
            );

            setDeleteOpen(false);
            setDepartmentToDelete(null);
        } catch (error) {
            console.error(
                "Failed to delete department:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete department.",
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Departments
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Organize your employees into company
                        departments.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() =>
                            void loadDepartments(true)
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
                        onClick={openCreateDialog}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Department
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Departments
                        </CardTitle>

                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {departments.length}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Departments in your company
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Assigned Employees
                        </CardTitle>

                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalEmployees}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Across all departments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Unassigned Employees
                        </CardTitle>

                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            —
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Available once employee
                            assignments are enabled
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Department List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Department Directory
                            </CardTitle>

                            <CardDescription>
                                Create and manage the departments
                                within your company.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search departments..."
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
                            <p className="text-sm text-muted-foreground">
                                Loading departments...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <p className="text-sm text-destructive">
                                {error}
                            </p>

                            <Button
                                variant="outline"
                                onClick={() =>
                                    void loadDepartments()
                                }
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : filteredDepartments.length ===
                        0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    {search
                                        ? "No departments found"
                                        : "No departments yet"}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search
                                        ? "Try a different search term."
                                        : "Create your first department to organize your employees."}
                                </p>
                            </div>

                            {!search && (
                                <Button
                                    onClick={
                                        openCreateDialog
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Department
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredDepartments.map(
                                (department) => (
                                    <div
                                        key={
                                            department.id
                                        }
                                        className="flex items-center justify-between gap-4 px-6 py-4"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Building2 className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {
                                                        department.name
                                                    }
                                                </p>

                                                <div className="mt-1 flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {department.employeeCount ??
                                                            0}{" "}
                                                        {(
                                                            department.employeeCount ??
                                                            0
                                                        ) ===
                                                            1
                                                            ? "employee"
                                                            : "employees"}
                                                    </Badge>

                                                    <span className="text-xs text-muted-foreground">
                                                        Created{" "}
                                                        {new Date(
                                                            department.createdAt,
                                                        ).toLocaleDateString()}
                                                    </span>
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
                                                        Department
                                                        actions
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openDetailsDialog(
                                                            department,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEditDialog(
                                                            department,
                                                        )
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit Department
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        openDeleteDialog(
                                                            department,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Department
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

            {/* Create / Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);

                    if (!open) {
                        resetForm();
                    }
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingDepartment
                                ? "Edit Department"
                                : "Add Department"}
                        </DialogTitle>

                        <DialogDescription>
                            {editingDepartment
                                ? "Update the department information."
                                : "Create a new department for your company."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="department-name">
                                Department Name
                            </Label>

                            <Input
                                id="department-name"
                                placeholder="e.g. Human Resources"
                                value={departmentName}
                                onChange={(event) =>
                                    setDepartmentName(
                                        event.target.value,
                                    )
                                }
                                disabled={saving}
                                autoFocus
                            />
                        </div>

                        {formError && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {formError}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setDialogOpen(false)
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={() =>
                                void handleSaveDepartment()
                            }
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingDepartment
                                    ? "Save Changes"
                                    : "Create Department"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            Department Details
                        </DialogTitle>

                        <DialogDescription>
                            Information about this department.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDepartment && (
                        <div className="space-y-5 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Building2 className="h-6 w-6" />
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        {
                                            selectedDepartment.name
                                        }
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        Department
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Employees
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {selectedDepartment.employeeCount ??
                                            0}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Created
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {new Date(
                                            selectedDepartment.createdAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Last Updated
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {new Date(
                                            selectedDepartment.updatedAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Department ID
                                    </p>

                                    <p className="mt-1 truncate font-mono text-xs">
                                        {
                                            selectedDepartment.id
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDetailsOpen(false)
                            }
                        >
                            Close
                        </Button>

                        {selectedDepartment && (
                            <Button
                                onClick={() => {
                                    setDetailsOpen(false);
                                    openEditDialog(
                                        selectedDepartment,
                                    );
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Department
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    if (!deleting) {
                        setDeleteOpen(open);

                        if (!open) {
                            setDepartmentToDelete(
                                null,
                            );
                        }
                    }
                }}
            >
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>
                            Delete Department
                        </DialogTitle>

                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-foreground">
                                {departmentToDelete?.name}
                            </span>
                            ?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        Deleting a department may affect employees
                        assigned to it. Make sure you have reviewed
                        its employee assignments before continuing.
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteOpen(false)
                            }
                            disabled={deleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() =>
                                void handleDeleteDepartment()
                            }
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Department"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}