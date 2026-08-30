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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

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

type VendorFormData = {
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

const emptyForm: VendorFormData = {
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

    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);

    const [editingVendor, setEditingVendor] =
        useState<Vendor | null>(null);

    const [viewingVendor, setViewingVendor] =
        useState<Vendor | null>(null);

    const [formData, setFormData] =
        useState<VendorFormData>(emptyForm);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] =
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
        const query = search.trim().toLowerCase();

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
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [vendors, search]);

    /* ---------------------------------------------------------------------- */
    /* Load Vendors                                                           */
    /* ---------------------------------------------------------------------- */

    async function loadVendors() {
        try {
            setLoading(true);

            const data = await apiGet<{
                vendors: Vendor[];
            }>("/api/purchases/vendors");

            setVendors(data.vendors ?? []);
        } catch (error) {
            console.error(
                "Failed to load vendors:",
                error,
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVendors();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Form Helpers                                                           */
    /* ---------------------------------------------------------------------- */

    function updateForm(
        field: keyof VendorFormData,
        value: string,
    ) {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function openAddVendor() {
        setEditingVendor(null);
        setFormData(emptyForm);
        setFormOpen(true);
    }

    function openEditVendor(vendor: Vendor) {
        setEditingVendor(vendor);

        setFormData({
            name: vendor.name,
            vendorCode: vendor.vendorCode,
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

        setFormOpen(true);
    }

    function openViewVendor(vendor: Vendor) {
        setViewingVendor(vendor);
        setViewOpen(true);
    }

    /* ---------------------------------------------------------------------- */
    /* Create / Update Vendor                                                 */
    /* ---------------------------------------------------------------------- */

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!formData.name.trim()) {
            return;
        }

        if (!formData.vendorCode.trim()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                vendorCode: formData.vendorCode.trim(),
                email: formData.email.trim() || null,
                phone: formData.phone.trim() || null,
                website: formData.website.trim() || null,
                gstNumber:
                    formData.gstNumber.trim() || null,
                panNumber:
                    formData.panNumber.trim() || null,
                billingAddress:
                    formData.billingAddress.trim() || null,
                shippingAddress:
                    formData.shippingAddress.trim() || null,
                city: formData.city.trim() || null,
                state: formData.state.trim() || null,
                country:
                    formData.country.trim() || "India",
                postalCode:
                    formData.postalCode.trim() || null,
                paymentTerms:
                    formData.paymentTerms.trim() || null,
                notes: formData.notes.trim() || null,
                status: formData.status,
            };

            if (editingVendor) {
                const data = await apiPut<{
                    vendor: Vendor;
                }>(
                    `/api/purchases/vendors/${editingVendor.id}`,
                    payload,
                );

                setVendors((current) =>
                    current.map((vendor) =>
                        vendor.id === editingVendor.id
                            ? data.vendor
                            : vendor,
                    ),
                );
            } else {
                const data = await apiPost<{
                    vendor: Vendor;
                }>(
                    "/api/purchases/vendors",
                    payload,
                );

                setVendors((current) => [
                    data.vendor,
                    ...current,
                ]);
            }

            setFormOpen(false);
            setEditingVendor(null);
            setFormData(emptyForm);
        } catch (error) {
            console.error(
                editingVendor
                    ? "Failed to update vendor:"
                    : "Failed to create vendor:",
                error,
            );
        } finally {
            setSaving(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Activate / Deactivate                                                  */
    /* ---------------------------------------------------------------------- */

    async function toggleVendorStatus(
        vendor: Vendor,
    ) {
        try {
            const data = await apiPut<{
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
                    postalCode: vendor.postalCode,
                    paymentTerms:
                        vendor.paymentTerms,
                    notes: vendor.notes,
                    status:
                        vendor.isActive
                            ? "inactive"
                            : "active",
                },
            );

            setVendors((current) =>
                current.map((item) =>
                    item.id === vendor.id
                        ? data.vendor
                        : item,
                ),
            );
        } catch (error) {
            console.error(
                "Failed to update vendor status:",
                error,
            );
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Delete Vendor                                                          */
    /* ---------------------------------------------------------------------- */

    async function handleDeleteVendor(
        vendor: Vendor,
    ) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${vendor.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(vendor.id);

            await apiDelete<{
                vendorId: string;
            }>(
                `/api/purchases/vendors/${vendor.id}`,
            );

            setVendors((current) =>
                current.filter(
                    (item) => item.id !== vendor.id,
                ),
            );
        } catch (error) {
            console.error(
                "Failed to delete vendor:",
                error,
            );
        } finally {
            setDeletingId(null);
        }
    }

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

                <Button onClick={openAddVendor}>
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
                                    ? "Try searching with a different vendor name, email, city, or country."
                                    : "Add your first vendor to start managing your purchasing relationships."}
                            </p>

                            {!search && (
                                <Button
                                    className="mt-5"
                                    onClick={openAddVendor}
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

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {vendor.vendorCode}
                                                </p>

                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">

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
                                                        openViewVendor(
                                                            vendor,
                                                        )
                                                    }
                                                >
                                                    View Vendor
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEditVendor(
                                                            vendor,
                                                        )
                                                    }
                                                >
                                                    Edit Vendor
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        toggleVendorStatus(
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
                                                    disabled={
                                                        deletingId ===
                                                        vendor.id
                                                    }
                                                    onClick={() =>
                                                        handleDeleteVendor(
                                                            vendor,
                                                        )
                                                    }
                                                >
                                                    {deletingId ===
                                                        vendor.id
                                                        ? "Deleting..."
                                                        : "Delete Vendor"}
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

            {/* ================================================================== */}
            {/* ADD / EDIT VENDOR DIALOG                                           */}
            {/* ================================================================== */}

            <Dialog
                open={formOpen}
                onOpenChange={setFormOpen}
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
                                : "Add a new supplier to your vendor directory."}
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
                                    <Label htmlFor="vendorName">
                                        Vendor Name
                                    </Label>

                                    <Input
                                        id="vendorName"
                                        value={formData.name}
                                        onChange={(event) =>
                                            updateForm(
                                                "name",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="ABC Suppliers Pvt Ltd"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vendorCode">
                                        Vendor Code
                                    </Label>

                                    <Input
                                        id="vendorCode"
                                        value={
                                            formData.vendorCode
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "vendorCode",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="VEN-0001"
                                    />
                                </div>

                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(event) =>
                                            updateForm(
                                                "email",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="vendor@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Phone
                                    </Label>

                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(event) =>
                                            updateForm(
                                                "phone",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">
                                    Website
                                </Label>

                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(event) =>
                                        updateForm(
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
                                    <Label htmlFor="gstNumber">
                                        GST Number
                                    </Label>

                                    <Input
                                        id="gstNumber"
                                        value={
                                            formData.gstNumber
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "gstNumber",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="29ABCDE1234F1Z5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="panNumber">
                                        PAN Number
                                    </Label>

                                    <Input
                                        id="panNumber"
                                        value={
                                            formData.panNumber
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "panNumber",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="ABCDE1234F"
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
                                <Label htmlFor="billingAddress">
                                    Billing Address
                                </Label>

                                <Textarea
                                    id="billingAddress"
                                    value={
                                        formData.billingAddress
                                    }
                                    onChange={(event) =>
                                        updateForm(
                                            "billingAddress",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Billing address"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shippingAddress">
                                    Shipping Address
                                </Label>

                                <Textarea
                                    id="shippingAddress"
                                    value={
                                        formData.shippingAddress
                                    }
                                    onChange={(event) =>
                                        updateForm(
                                            "shippingAddress",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Shipping address"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="space-y-2">
                                    <Label htmlFor="city">
                                        City
                                    </Label>

                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(event) =>
                                            updateForm(
                                                "city",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Bengaluru"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">
                                        State
                                    </Label>

                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={(event) =>
                                            updateForm(
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
                                    <Label htmlFor="country">
                                        Country
                                    </Label>

                                    <Input
                                        id="country"
                                        value={
                                            formData.country
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "country",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">
                                        Postal Code
                                    </Label>

                                    <Input
                                        id="postalCode"
                                        value={
                                            formData.postalCode
                                        }
                                        onChange={(event) =>
                                            updateForm(
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

                        {/* Payment */}

                        <div className="space-y-4">

                            <h3 className="text-sm font-semibold">
                                Payment & Notes
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="paymentTerms">
                                    Payment Terms
                                </Label>

                                <Input
                                    id="paymentTerms"
                                    value={
                                        formData.paymentTerms
                                    }
                                    onChange={(event) =>
                                        updateForm(
                                            "paymentTerms",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Net 30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Notes
                                </Label>

                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(event) =>
                                        updateForm(
                                            "notes",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Additional notes about this vendor"
                                />
                            </div>

                        </div>

                        {/* Status */}

                        <div className="space-y-2">
                            <Label htmlFor="status">
                                Status
                            </Label>

                            <select
                                id="status"
                                value={formData.status}
                                onChange={(event) =>
                                    updateForm(
                                        "status",
                                        event.target.value as
                                        | "active"
                                        | "inactive",
                                    )
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setFormOpen(false)
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

            {/* ================================================================== */}
            {/* VIEW VENDOR DIALOG                                                 */}
            {/* ================================================================== */}

            <Dialog
                open={viewOpen}
                onOpenChange={setViewOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">

                    <DialogHeader>
                        <DialogTitle>
                            {viewingVendor?.name}
                        </DialogTitle>

                        <DialogDescription>
                            Vendor Code:{" "}
                            {viewingVendor?.vendorCode}
                        </DialogDescription>
                    </DialogHeader>

                    {viewingVendor && (
                        <div className="space-y-6">

                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary">
                                    {viewingVendor.name
                                        .trim()
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        {viewingVendor.name}
                                    </p>

                                    <Badge
                                        variant={
                                            viewingVendor.isActive
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {viewingVendor.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Email
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.email ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.phone ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Website
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.website ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        GST Number
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.gstNumber ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        PAN Number
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.panNumber ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Payment Terms
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.paymentTerms ||
                                            "—"}
                                    </p>
                                </div>

                            </div>

                            <Separator />

                            <div className="grid gap-6 sm:grid-cols-2">

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Billing Address
                                    </p>

                                    <p className="mt-1 whitespace-pre-line text-sm">
                                        {viewingVendor.billingAddress ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Shipping Address
                                    </p>

                                    <p className="mt-1 whitespace-pre-line text-sm">
                                        {viewingVendor.shippingAddress ||
                                            "—"}
                                    </p>
                                </div>

                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        City
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.city ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        State
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.state ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Postal Code
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {viewingVendor.postalCode ||
                                            "—"}
                                    </p>
                                </div>

                            </div>

                            {viewingVendor.notes && (
                                <>
                                    <Separator />

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Notes
                                        </p>

                                        <p className="mt-1 whitespace-pre-line text-sm">
                                            {viewingVendor.notes}
                                        </p>
                                    </div>
                                </>
                            )}

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setViewOpen(false)
                                    }
                                >
                                    Close
                                </Button>

                                <Button
                                    onClick={() => {
                                        setViewOpen(false);
                                        openEditVendor(
                                            viewingVendor,
                                        );
                                    }}
                                >
                                    Edit Vendor
                                </Button>
                            </DialogFooter>

                        </div>
                    )}

                </DialogContent>
            </Dialog>

        </div>
    );
}