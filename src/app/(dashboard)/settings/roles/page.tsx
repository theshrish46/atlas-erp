"use client";

import { useEffect, useMemo, useState } from "react";
import {
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Users,
    Pencil,
    Trash2,
    Eye,
    LockKeyhole,
    Check,
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

type Permission = {
    id: string;
    key: string;
    description?: string | null;
};

type Role = {
    id: string;
    name: string;
    companyId: string;
    description?: string | null;
    isSystem?: boolean;
    createdAt: string;
    updatedAt: string;
    employeeCount?: number;
    permissions?: Permission[];
};

type RolesResponse = {
    roles?: Role[];
};

type RoleResponse = {
    role: Role;
};

type PermissionsResponse = {
    permissions?: Permission[];
};

type RoleForm = {
    name: string;
    description: string;
};

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>(
        [],
    );

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(
        null,
    );

    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [permissionsOpen, setPermissionsOpen] =
        useState(false);

    const [editingRole, setEditingRole] =
        useState<Role | null>(null);

    const [selectedRole, setSelectedRole] =
        useState<Role | null>(null);

    const [roleToDelete, setRoleToDelete] =
        useState<Role | null>(null);

    const [permissionSearch, setPermissionSearch] =
        useState("");

    const [selectedPermissionIds, setSelectedPermissionIds] =
        useState<string[]>([]);

    const [form, setForm] = useState<RoleForm>({
        name: "",
        description: "",
    });

    const [saving, setSaving] = useState(false);
    const [savingPermissions, setSavingPermissions] =
        useState(false);
    const [deleting, setDeleting] = useState(false);

    // ---------------------------------------------------------
    // LOAD ROLES
    // ---------------------------------------------------------

    async function loadRoles(showRefreshState = false) {
        try {
            if (showRefreshState) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(null);

            const response =
                await apiGet<RolesResponse>(
                    "/api/settings/roles",
                );

            setRoles(response?.roles ?? []);
        } catch (error) {
            console.error(
                "Failed to load roles:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load roles.",
            );

            setRoles([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    // ---------------------------------------------------------
    // LOAD PERMISSIONS
    // ---------------------------------------------------------

    async function loadPermissions() {
        try {
            const response =
                await apiGet<PermissionsResponse>(
                    "/api/settings/permissions",
                );

            setPermissions(
                response?.permissions ?? [],
            );
        } catch (error) {
            console.error(
                "Failed to load permissions:",
                error,
            );
        }
    }

    useEffect(() => {
        void loadRoles();
        void loadPermissions();
    }, []);

    // ---------------------------------------------------------
    // FILTER ROLES
    // ---------------------------------------------------------

    const filteredRoles = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return roles;
        }

        return roles.filter((role) => {
            return (
                role.name
                    .toLowerCase()
                    .includes(query) ||
                role.description
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [roles, search]);

    // ---------------------------------------------------------
    // FILTER PERMISSIONS
    // ---------------------------------------------------------

    const filteredPermissions = useMemo(() => {
        const query =
            permissionSearch.trim().toLowerCase();

        if (!query) {
            return permissions;
        }

        return permissions.filter((permission) => {
            return (
                permission.key
                    .toLowerCase()
                    .includes(query) ||
                permission.description
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [permissions, permissionSearch]);

    // ---------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------

    const systemRoleCount = useMemo(() => {
        return roles.filter(
            (role) => role.isSystem,
        ).length;
    }, [roles]);

    const totalEmployees = useMemo(() => {
        return roles.reduce(
            (total, role) =>
                total + (role.employeeCount ?? 0),
            0,
        );
    }, [roles]);

    // ---------------------------------------------------------
    // FORM
    // ---------------------------------------------------------

    function resetForm() {
        setForm({
            name: "",
            description: "",
        });

        setFormError(null);
        setEditingRole(null);
    }

    function openCreateDialog() {
        resetForm();
        setDialogOpen(true);
    }

    function openEditDialog(role: Role) {
        if (role.isSystem) {
            return;
        }

        setEditingRole(role);

        setForm({
            name: role.name,
            description: role.description ?? "",
        });

        setFormError(null);
        setDialogOpen(true);
    }

    // ---------------------------------------------------------
    // CREATE / UPDATE ROLE
    // ---------------------------------------------------------

    async function handleSaveRole() {
        const name = form.name.trim();
        const description = form.description.trim();

        if (!name) {
            setFormError(
                "Role name is required.",
            );
            return;
        }

        if (name.length < 2) {
            setFormError(
                "Role name must contain at least 2 characters.",
            );
            return;
        }

        if (name.length > 100) {
            setFormError(
                "Role name cannot exceed 100 characters.",
            );
            return;
        }

        try {
            setSaving(true);
            setFormError(null);

            if (editingRole) {
                const response =
                    await apiPut<
                        RoleResponse,
                        {
                            name: string;
                            description: string | null;
                        }
                    >(
                        `/api/settings/roles/${editingRole.id}`,
                        {
                            name,
                            description:
                                description || null,
                        },
                    );

                if (response?.role) {
                    setRoles((current) =>
                        current.map((role) =>
                            role.id ===
                                editingRole.id
                                ? {
                                    ...role,
                                    ...response.role,
                                }
                                : role,
                        ),
                    );
                } else {
                    await loadRoles();
                }
            } else {
                const response =
                    await apiPost<
                        RoleResponse,
                        {
                            name: string;
                            description: string | null;
                        }
                    >(
                        "/api/settings/roles",
                        {
                            name,
                            description:
                                description || null,
                        },
                    );

                if (response?.role) {
                    setRoles((current) => [
                        response.role,
                        ...current,
                    ]);
                } else {
                    await loadRoles();
                }
            }

            setDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error(
                "Failed to save role:",
                error,
            );

            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to save role.",
            );
        } finally {
            setSaving(false);
        }
    }

    // ---------------------------------------------------------
    // PERMISSIONS
    // ---------------------------------------------------------

    async function openPermissionsDialog(
        role: Role,
    ) {
        if (role.isSystem) {
            return;
        }

        try {
            setSelectedRole(role);

            /*
             * Fetch the latest role data so that the permission
             * list is always current.
             */
            const response =
                await apiGet<RoleResponse>(
                    `/api/settings/roles/${role.id}`,
                );

            const latestRole =
                response?.role ?? role;

            setSelectedRole(latestRole);

            setSelectedPermissionIds(
                latestRole.permissions?.map(
                    (permission) =>
                        permission.id,
                ) ?? [],
            );

            setPermissionSearch("");
            setPermissionsOpen(true);
        } catch (error) {
            console.error(
                "Failed to load role permissions:",
                error,
            );

            /*
             * Fall back to whatever permission information
             * we already have in the role list.
             */
            setSelectedPermissionIds(
                role.permissions?.map(
                    (permission) =>
                        permission.id,
                ) ?? [],
            );

            setPermissionSearch("");
            setPermissionsOpen(true);
        }
    }

    function togglePermission(
        permissionId: string,
    ) {
        setSelectedPermissionIds((current) => {
            if (current.includes(permissionId)) {
                return current.filter(
                    (id) => id !== permissionId,
                );
            }

            return [...current, permissionId];
        });
    }

    function selectAllPermissions() {
        setSelectedPermissionIds(
            permissions.map(
                (permission) => permission.id,
            ),
        );
    }

    function clearAllPermissions() {
        setSelectedPermissionIds([]);
    }

    async function savePermissions() {
        if (!selectedRole) {
            return;
        }

        try {
            setSavingPermissions(true);

            const response =
                await apiPut<
                    RoleResponse,
                    {
                        permissionIds: string[];
                    }
                >(
                    `/api/settings/roles/${selectedRole.id}/permissions`,
                    {
                        permissionIds:
                            selectedPermissionIds,
                    },
                );

            if (response?.role) {
                setSelectedRole(
                    response.role,
                );

                setRoles((current) =>
                    current.map((role) =>
                        role.id ===
                            selectedRole.id
                            ? {
                                ...role,
                                ...response.role,
                            }
                            : role,
                    ),
                );
            } else {
                await loadRoles();
            }

            setPermissionsOpen(false);
        } catch (error) {
            console.error(
                "Failed to save permissions:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to save permissions.",
            );
        } finally {
            setSavingPermissions(false);
        }
    }

    // ---------------------------------------------------------
    // DETAILS
    // ---------------------------------------------------------

    function openDetailsDialog(role: Role) {
        setSelectedRole(role);
        setDetailsOpen(true);
    }

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------

    function openDeleteDialog(role: Role) {
        if (role.isSystem) {
            return;
        }

        setRoleToDelete(role);
        setDeleteOpen(true);
    }

    async function handleDeleteRole() {
        if (!roleToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setError(null);

            await apiDelete(
                `/api/settings/roles/${roleToDelete.id}`,
            );

            setRoles((current) =>
                current.filter(
                    (role) =>
                        role.id !==
                        roleToDelete.id,
                ),
            );

            setDeleteOpen(false);
            setRoleToDelete(null);
        } catch (error) {
            console.error(
                "Failed to delete role:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete role.",
            );
        } finally {
            setDeleting(false);
        }
    }

    // ---------------------------------------------------------
    // UI
    // ---------------------------------------------------------

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Roles & Permissions
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Control what users can access and
                        manage within your company.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() =>
                            void loadRoles(true)
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
                        onClick={
                            openCreateDialog
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Role
                    </Button>
                </div>
            </div>

            {/* Summary */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Roles
                        </CardTitle>

                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {roles.length}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Roles configured for your
                            company
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            System Roles
                        </CardTitle>

                        <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {systemRoleCount}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Protected system roles
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
                            Across all roles
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Roles */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Role Directory
                            </CardTitle>

                            <CardDescription>
                                Create and manage access
                                roles for your employees.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search roles..."
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
                                Loading roles...
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
                                    void loadRoles()
                                }
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : filteredRoles.length ===
                        0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    {search
                                        ? "No roles found"
                                        : "No roles yet"}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search
                                        ? "Try a different search term."
                                        : "Create your first role to control employee access."}
                                </p>
                            </div>

                            {!search && (
                                <Button
                                    onClick={
                                        openCreateDialog
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Role
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredRoles.map(
                                (role) => (
                                    <div
                                        key={role.id}
                                        className="flex items-center justify-between gap-4 px-6 py-4"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <ShieldCheck className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-medium">
                                                        {
                                                            role.name
                                                        }
                                                    </p>

                                                    {role.isSystem && (
                                                        <Badge variant="secondary">
                                                            System
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="mt-1 max-w-xl truncate text-sm text-muted-foreground">
                                                    {role.description ||
                                                        "No description provided."}
                                                </p>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {role.employeeCount ??
                                                            0}{" "}
                                                        {(role.employeeCount ??
                                                            0) ===
                                                            1
                                                            ? "employee"
                                                            : "employees"}
                                                    </Badge>

                                                    <Badge variant="outline">
                                                        {role.permissions
                                                            ?.length ??
                                                            0}{" "}
                                                        {(role.permissions
                                                            ?.length ??
                                                            0) ===
                                                            1
                                                            ? "permission"
                                                            : "permissions"}
                                                    </Badge>
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
                                                        Role actions
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openDetailsDialog(
                                                            role,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>

                                                {!role.isSystem && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                void openPermissionsDialog(
                                                                    role,
                                                                )
                                                            }
                                                        >
                                                            <LockKeyhole className="mr-2 h-4 w-4" />
                                                            Manage Permissions
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    role,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Role
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    role,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Role
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit Role */}

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
                            {editingRole
                                ? "Edit Role"
                                : "Create Role"}
                        </DialogTitle>

                        <DialogDescription>
                            {editingRole
                                ? "Update the role information."
                                : "Create a custom role for your company."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">
                                Role Name
                            </Label>

                            <Input
                                id="role-name"
                                placeholder="e.g. Sales Manager"
                                value={form.name}
                                onChange={(event) =>
                                    setForm(
                                        (current) => ({
                                            ...current,
                                            name: event
                                                .target
                                                .value,
                                        }),
                                    )
                                }
                                disabled={saving}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role-description">
                                Description
                            </Label>

                            <Input
                                id="role-description"
                                placeholder="Describe what this role is responsible for"
                                value={
                                    form.description
                                }
                                onChange={(event) =>
                                    setForm(
                                        (current) => ({
                                            ...current,
                                            description:
                                                event
                                                    .target
                                                    .value,
                                        }),
                                    )
                                }
                                disabled={saving}
                            />
                        </div>

                        <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="flex gap-3">
                                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                <div>
                                    <p className="text-sm font-medium">
                                        Permissions
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Create the role first,
                                        then use{" "}
                                        <strong>
                                            Manage Permissions
                                        </strong>{" "}
                                        to control access.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {formError && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {formError}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDialogOpen(false)
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() =>
                                void handleSaveRole()
                            }
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingRole
                                    ? "Save Changes"
                                    : "Create Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Permissions */}

            <Dialog
                open={permissionsOpen}
                onOpenChange={(open) => {
                    if (!savingPermissions) {
                        setPermissionsOpen(open);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>
                            Manage Permissions
                        </DialogTitle>

                        <DialogDescription>
                            Select the permissions that
                            employees assigned to{" "}
                            <strong>
                                {selectedRole?.name}
                            </strong>{" "}
                            should have.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Permission controls */}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    className="pl-9"
                                    placeholder="Search permissions..."
                                    value={
                                        permissionSearch
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setPermissionSearch(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={
                                        selectAllPermissions
                                    }
                                >
                                    Select All
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={
                                        clearAllPermissions
                                    }
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>

                        {/* Selected count */}

                        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4 text-muted-foreground" />

                                <span className="text-sm font-medium">
                                    Selected Permissions
                                </span>
                            </div>

                            <Badge>
                                {
                                    selectedPermissionIds.length
                                }{" "}
                                / {permissions.length}
                            </Badge>
                        </div>

                        {/* Permission list */}

                        <div className="max-h-[420px] overflow-y-auto rounded-lg border">
                            {filteredPermissions.length ===
                                0 ? (
                                <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                                    <div>
                                        <LockKeyhole className="mx-auto h-6 w-6 text-muted-foreground" />

                                        <p className="mt-2 text-sm font-medium">
                                            No permissions found
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Make sure your
                                            permissions have
                                            been seeded.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredPermissions.map(
                                        (
                                            permission,
                                        ) => {
                                            const selected =
                                                selectedPermissionIds.includes(
                                                    permission.id,
                                                );

                                            return (
                                                <button
                                                    key={
                                                        permission.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        togglePermission(
                                                            permission.id,
                                                        )
                                                    }
                                                    className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${selected
                                                        ? "bg-primary/5"
                                                        : ""
                                                        }`}
                                                >
                                                    <div
                                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-input"
                                                            }`}
                                                    >
                                                        {selected && (
                                                            <Check className="h-3.5 w-3.5" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-mono text-sm font-medium">
                                                            {
                                                                permission.key
                                                            }
                                                        </p>

                                                        {permission.description && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {
                                                                    permission.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setPermissionsOpen(
                                    false,
                                )
                            }
                            disabled={
                                savingPermissions
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() =>
                                void savePermissions()
                            }
                            disabled={
                                savingPermissions
                            }
                        >
                            {savingPermissions
                                ? "Saving..."
                                : "Save Permissions"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details */}

            <Dialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            >
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            Role Details
                        </DialogTitle>

                        <DialogDescription>
                            View role configuration and
                            assigned permissions.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRole && (
                        <div className="space-y-5 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">
                                            {
                                                selectedRole.name
                                            }
                                        </h3>

                                        {selectedRole.isSystem && (
                                            <Badge variant="secondary">
                                                System
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {selectedRole.description ||
                                            "No description provided."}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Employees
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {selectedRole.employeeCount ??
                                            0}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Permissions
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {selectedRole.permissions
                                            ?.length ??
                                            0}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Created
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {new Date(
                                            selectedRole.createdAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        Permissions
                                    </p>

                                    {!selectedRole.isSystem && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setDetailsOpen(
                                                    false,
                                                );

                                                void openPermissionsDialog(
                                                    selectedRole,
                                                );
                                            }}
                                        >
                                            <LockKeyhole className="mr-2 h-4 w-4" />
                                            Manage
                                        </Button>
                                    )}
                                </div>

                                {selectedRole.permissions
                                    ?.length ? (
                                    <div className="max-h-52 space-y-2 overflow-y-auto">
                                        {selectedRole.permissions.map(
                                            (
                                                permission,
                                            ) => (
                                                <div
                                                    key={
                                                        permission.id
                                                    }
                                                    className="rounded-md border px-3 py-2"
                                                >
                                                    <p className="font-mono text-sm">
                                                        {
                                                            permission.key
                                                        }
                                                    </p>

                                                    {permission.description && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {
                                                                permission.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-dashed p-6 text-center">
                                        <LockKeyhole className="mx-auto h-5 w-5 text-muted-foreground" />

                                        <p className="mt-2 text-sm font-medium">
                                            No permissions
                                            assigned
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Use Manage
                                            Permissions to
                                            configure this
                                            role.
                                        </p>
                                    </div>
                                )}
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

                        {selectedRole &&
                            !selectedRole.isSystem && (
                                <Button
                                    onClick={() => {
                                        setDetailsOpen(
                                            false,
                                        );

                                        openEditDialog(
                                            selectedRole,
                                        );
                                    }}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Role
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
                            setRoleToDelete(null);
                        }
                    }
                }}
            >
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>
                            Delete Role
                        </DialogTitle>

                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-foreground">
                                {roleToDelete?.name}
                            </span>
                            ?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        Deleting a role may affect employees
                        who are currently assigned to it.
                        Review the assignments before
                        continuing.
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
                                void handleDeleteRole()
                            }
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}