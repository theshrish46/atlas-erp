"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    ArrowLeft,
    Building2,
    Mail,
    MapPin,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    Store,
    Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

import {
    apiDelete,
    apiGet,
    apiPost,
    apiPut,
} from "@/lib/api/client";

import { ApiError } from "@/lib/api/errors";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Vendor = {
    id: string;
    companyId: string;
    name: string;
    vendorCode: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    gstNumber: string | null;
    panNumber: string | null;
    billingAddress: string | null;
    shippingAddress: string | null;
    city: string | null;
    state: string | null;
    country: string;
    postalCode: string | null;
    paymentTerms: string | null;
    notes: string | null;
    status: "active" | "inactive";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type VendorForm = {
    name: string;
    vendorCode: string;
    email: string;
    phone: string;
    website: string;
    gstNumber: string;
    panNumber: string;
    billingAddress: string;
    shippingAddress: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    paymentTerms: string;
    notes: string;
    status: "active" | "inactive";
};

const emptyVendorForm: VendorForm = {
    name: "",
    vendorCode: "",
    email: "",
    phone: "",
    website: "",
    gstNumber: "",
    panNumber: "",
    billingAddress: "",
    shippingAddress: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    paymentTerms: "",
    notes: "",
    status: "active",
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function VendorsPage() {
    const [search, setSearch] = useState("");

    const [vendors, setVendors] = useState<Vendor[]>([]);

    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editingVendor, setEditingVendor] =
        useState<Vendor | null>(null);

    const [form, setForm] =
        useState<VendorForm>(emptyVendorForm);

    const [saving, setSaving] = useState(false);

    const [deletingVendorId, setDeletingVendorId] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------------- */
    /* Statistics                                                             */
    /* ---------------------------------------------------------------------- */

    const activeVendors = useMemo(() => {
        return vendors.filter(
            (vendor) => vendor.isActive,
        ).length;
    }, [vendors]);

    const inactiveVendors = useMemo(() => {
        return vendors.filter(
            (vendor) => !vendor.isActive,
        ).length;
    }, [vendors]);

    /* ---------------------------------------------------------------------- */
    /* Search                                                                 */
    /* ---------------------------------------------------------------------- */

    const filteredVendors = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return vendors;
        }

        return vendors.filter((vendor) => {
            return (
                vendor.name
                    .toLowerCase()
                    .includes(query) ||
                vendor.vendorCode
                    .toLowerCase()
                    .includes(query) ||
                vendor.email
                    ?.toLowerCase()
                    .includes(query) ||
                vendor.phone
                    ?.toLowerCase()
                    .includes(query) ||
                vendor.city
                    ?.toLowerCase()
                    .includes(query) ||
                vendor.country
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [vendors, search]);

    /* ---------------------------------------------------------------------- */
    /* Load Vendors                                                           */
    /* ---------------------------------------------------------------------- */

    const loadVendors = async () => {
        try {
            setLoading(true);

            const result = await apiGet<{
                vendors: Vendor[];
            }>("/api/purchases/vendors");

            setVendors(result.vendors ?? []);
        } catch (error) {
            console.error(
                "Failed to load vendors:",
                error,
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Form                                                                   */
    /* ---------------------------------------------------------------------- */

    const updateField = (
        field: keyof VendorForm,
        value: string,
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const openCreateDialog = () => {
        setEditingVendor(null);
        setForm(emptyVendorForm);
        setDialogOpen(true);
    };

    const openEditDialog = (vendor: Vendor) => {
        setEditingVendor(vendor);

        setForm({
            name: vendor.name ?? "",
            vendorCode: vendor.vendorCode ?? "",
            email: vendor.email ?? "",
            phone: vendor.phone ?? "",
            website: vendor.website ?? "",
            gstNumber: vendor.gstNumber ?? "",
            panNumber: vendor.panNumber ?? "",
            billingAddress: vendor.billingAddress ?? "",
            shippingAddress: vendor.shippingAddress ?? "",
            city: vendor.city ?? "",
            state: vendor.state ?? "",
            country: vendor.country ?? "India",
            postalCode: vendor.postalCode ?? "",
            paymentTerms: vendor.paymentTerms ?? "",
            notes: vendor.notes ?? "",
            status: vendor.status,
        });

        setDialogOpen(true);
    };

    /* ---------------------------------------------------------------------- */
    /* Create / Update                                                        */
    /* ---------------------------------------------------------------------- */

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!form.name.trim()) {
            return;
        }

        if (!form.vendorCode.trim()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: form.name.trim(),
                vendorCode: form.vendorCode.trim(),

                email:
                    form.email.trim() || null,

                phone:
                    form.phone.trim() || null,

                website:
                    form.website.trim() || null,

                gstNumber:
                    form.gstNumber.trim() || null,

                panNumber:
                    form.panNumber.trim() || null,

                billingAddress:
                    form.billingAddress.trim() || null,

                shippingAddress:
                    form.shippingAddress.trim() || null,

                city:
                    form.city.trim() || null,

                state:
                    form.state.trim() || null,

                country:
                    form.country.trim() || "India",

                postalCode:
                    form.postalCode.trim() || null,

                paymentTerms:
                    form.paymentTerms.trim() || null,

                notes:
                    form.notes.trim() || null,

                status: form.status,
            };

            if (editingVendor) {
                const result = await apiPut<{
                    vendor: Vendor;
                }>(
                    `/api/purchases/vendors/${editingVendor.id}`,
                    payload,
                );

                setVendors((current) =>
                    current.map((vendor) =>
                        vendor.id === editingVendor.id
                            ? result.vendor
                            : vendor,
                    ),
                );
            } else {
                const result = await apiPost<{
                    vendor: Vendor;
                }>(
                    "/api/purchases/vendors",
                    payload,
                );

                setVendors((current) => [
                    result.vendor,
                    ...current,
                ]);
            }

            setDialogOpen(false);
            setEditingVendor(null);
            setForm(emptyVendorForm);
        } catch (error) {
            console.error(
                "Failed to save vendor:",
                error,
            );
        } finally {
            setSaving(false);
        }
    };

    /* ---------------------------------------------------------------------- */
    /* Activate / Deactivate                                                  */
    /* ---------------------------------------------------------------------- */

    const handleToggleStatus = async (
        vendor: Vendor,
    ) => {
        try {
            const nextStatus =
                vendor.isActive
                    ? "inactive"
                    : "active";

            const result = await apiPut<{
                vendor: Vendor;
            }>(
                `/api/purchases/vendors/${vendor.id}`,
                {
                    name: vendor.name,
                    vendorCode: vendor.vendorCode,
                    email: vendor.email,
                    phone: vendor.phone,
                    website: vendor.website,
                    gstNumber: vendor.gstNumber,
                    panNumber: vendor.panNumber,
                    billingAddress:
                        vendor.billingAddress,
                    shippingAddress:
                        vendor.shippingAddress,
                    city: vendor.city,
                    state: vendor.state,
                    country: vendor.country,
                    postalCode:
                        vendor.postalCode,
                    paymentTerms:
                        vendor.paymentTerms,
                    notes: vendor.notes,
                    status: nextStatus,
                },
            );

            setVendors((current) =>
                current.map((currentVendor) =>
                    currentVendor.id === vendor.id
                        ? result.vendor
                        : currentVendor,
                ),
            );
        } catch (error) {
            console.error(
                "Failed to update vendor status:",
                error,
            );
        }
    };

    /* ---------------------------------------------------------------------- */
    /* Delete                                                                 */
    /* ---------------------------------------------------------------------- */

    const handleDelete = async (
        vendor: Vendor,
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${vendor.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingVendorId(vendor.id);

            await apiDelete<{
                vendorId: string;
            }>(
                `/api/purchases/vendors/${vendor.id}`,
            );

            setVendors((current) =>
                current.filter(
                    (currentVendor) =>
                        currentVendor.id !== vendor.id,
                ),
            );
        } catch (error) {
            console.error(
                "Failed to delete vendor:",
                error,
            );
        } finally {
            setDeletingVendorId(null);
        }
    };

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* Header                                                            */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/purchases"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
                            title="Back to Purchases"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <h2 className="text-xl font-semibold tracking-tight">
                            Vendors
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage the suppliers and vendors your company
                        purchases from.
                    </p>
                </div>

                <Button
                    onClick={openCreateDialog}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vendor
                </Button>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Statistics                                                        */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Vendors
                        </CardTitle>

                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {vendors.length}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Registered suppliers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Vendors
                        </CardTitle>

                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activeVendors}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Currently available for purchasing
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Inactive Vendors
                        </CardTitle>

                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {inactiveVendors}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Currently inactive
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Vendor Directory                                                  */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Vendor Directory
                            </CardTitle>

                            <CardDescription>
                                View and manage your company's suppliers.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search vendors..."
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
                        <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">
                            Loading vendors...
                        </div>
                    ) : filteredVendors.length === 0 ? (
                        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Store className="h-6 w-6" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                {search
                                    ? "No vendors found"
                                    : "No vendors yet"}
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                {search
                                    ? "Try searching with a different vendor name, code, email, city, or country."
                                    : "Add your first vendor to start managing your purchasing relationships."}
                            </p>

                            {!search && (
                                <Button
                                    className="mt-5"
                                    onClick={
                                        openCreateDialog
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Vendor
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredVendors.map(
                                (vendor) => (
                                    <div
                                        key={vendor.id}
                                        className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary">
                                                {vendor.name
                                                    .trim()
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-medium">
                                                        {vendor.name}
                                                    </p>

                                                    <Badge
                                                        variant={
                                                            vendor.isActive
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {vendor.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </Badge>
                                                </div>

                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span>
                                                        Code:{" "}
                                                        {vendor.vendorCode}
                                                    </span>

                                                    {vendor.email && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {vendor.email}
                                                        </span>
                                                    )}

                                                    {vendor.phone && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {vendor.phone}
                                                        </span>
                                                    )}

                                                    {(vendor.city ||
                                                        vendor.country) && (
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin className="h-3.5 w-3.5" />

                                                                {vendor.city
                                                                    ? `${vendor.city}, `
                                                                    : ""}

                                                                {vendor.country}
                                                            </span>
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
                                                    disabled={
                                                        deletingVendorId ===
                                                        vendor.id
                                                    }
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />

                                                    <span className="sr-only">
                                                        Vendor actions
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEditDialog(
                                                            vendor,
                                                        )
                                                    }
                                                >
                                                    Edit Vendor
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            vendor,
                                                        )
                                                    }
                                                >
                                                    {vendor.isActive
                                                        ? "Deactivate Vendor"
                                                        : "Activate Vendor"}
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(
                                                            vendor,
                                                        )
                                                    }
                                                >
                                                    Delete Vendor
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

            {/* ---------------------------------------------------------------- */}
            {/* Add / Edit Vendor Dialog                                          */}
            {/* ---------------------------------------------------------------- */}

            <Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingVendor
                                ? "Edit Vendor"
                                : "Add Vendor"}
                        </DialogTitle>

                        <DialogDescription>
                            {editingVendor
                                ? "Update the vendor information below."
                                : "Add a supplier to your company's vendor directory."}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Basic Information */}

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">
                                Basic Information
                            </h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor-name">
                                        Vendor Name
                                    </Label>

                                    <Input
                                        id="vendor-name"
                                        value={form.name}
                                        onChange={(event) =>
                                            updateField(
                                                "name",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="ABC Supplies Pvt Ltd"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vendor-code">
                                        Vendor Code
                                    </Label>

                                    <Input
                                        id="vendor-code"
                                        value={form.vendorCode}
                                        onChange={(event) =>
                                            updateField(
                                                "vendorCode",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="VEN-001"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor-email">
                                        Email
                                    </Label>

                                    <Input
                                        id="vendor-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(event) =>
                                            updateField(
                                                "email",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="vendor@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vendor-phone">
                                        Phone
                                    </Label>

                                    <Input
                                        id="vendor-phone"
                                        value={form.phone}
                                        onChange={(event) =>
                                            updateField(
                                                "phone",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vendor-website">
                                    Website
                                </Label>

                                <Input
                                    id="vendor-website"
                                    value={form.website}
                                    onChange={(event) =>
                                        updateField(
                                            "website",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Tax Information */}

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">
                                Tax Information
                            </h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor-gst">
                                        GST Number
                                    </Label>

                                    <Input
                                        id="vendor-gst"
                                        value={form.gstNumber}
                                        onChange={(event) =>
                                            updateField(
                                                "gstNumber",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="22AAAAA0000A1Z5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vendor-pan">
                                        PAN Number
                                    </Label>

                                    <Input
                                        id="vendor-pan"
                                        value={form.panNumber}
                                        onChange={(event) =>
                                            updateField(
                                                "panNumber",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="AAAAA0000A"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Address */}

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">
                                Address
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="billing-address">
                                    Billing Address
                                </Label>

                                <Textarea
                                    id="billing-address"
                                    value={
                                        form.billingAddress
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "billingAddress",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Billing address"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shipping-address">
                                    Shipping Address
                                </Label>

                                <Textarea
                                    id="shipping-address"
                                    value={
                                        form.shippingAddress
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "shippingAddress",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Shipping address"
                                    rows={2}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor-city">
                                        City
                                    </Label>

                                    <Input
                                        id="vendor-city"
                                        value={form.city}
                                        onChange={(event) =>
                                            updateField(
                                                "city",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Bengaluru"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vendor-state">
                                        State
                                    </Label>

                                    <Input
                                        id="vendor-state"
                                        value={form.state}
                                        onChange={(event) =>
                                            updateField(
                                                "state",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Karnataka"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="vendor-country">
                                        Country
                                    </Label>

                                    <Input
                                        id="vendor-country"
                                        value={form.country}
                                        onChange={(event) =>
                                            updateField(
                                                "country",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vendor-postal">
                                        Postal Code
                                    </Label>

                                    <Input
                                        id="vendor-postal"
                                        value={form.postalCode}
                                        onChange={(event) =>
                                            updateField(
                                                "postalCode",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="560001"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Purchasing */}

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">
                                Purchasing
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="payment-terms">
                                    Payment Terms
                                </Label>

                                <Input
                                    id="payment-terms"
                                    value={
                                        form.paymentTerms
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "paymentTerms",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Net 30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vendor-notes">
                                    Notes
                                </Label>

                                <Textarea
                                    id="vendor-notes"
                                    value={form.notes}
                                    onChange={(event) =>
                                        updateField(
                                            "notes",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Additional notes about this vendor"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vendor-status">
                                    Status
                                </Label>

                                <select
                                    id="vendor-status"
                                    value={form.status}
                                    onChange={(event) =>
                                        updateField(
                                            "status",
                                            event.target.value as
                                            | "active"
                                            | "inactive",
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>
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
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingVendor
                                        ? "Update Vendor"
                                        : "Create Vendor"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}