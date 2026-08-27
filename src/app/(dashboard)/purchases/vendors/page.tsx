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

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function VendorsPage() {
    const [search, setSearch] = useState("");

    /*
     * Temporary data.
     *
     * This will be replaced with the vendors API once the vendor
     * schema and business requirements are finalized.
     */
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

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
                vendor.email
                    .toLowerCase()
                    .includes(query) ||
                vendor.phone
                    .toLowerCase()
                    .includes(query) ||
                vendor.city
                    .toLowerCase()
                    .includes(query) ||
                vendor.country
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [vendors, search]);




    useEffect(() => {
        async function loadVendors() {
            try {
                setLoading(true);

                const response = await fetch(
                    "/api/purchases/vendors",
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Failed to fetch vendors",
                    );
                }

                setVendors(result.data ?? []);
            } catch (error) {
                console.error(
                    "Failed to load vendors:",
                    error,
                );
            } finally {
                setLoading(false);
            }
        }

        loadVendors();
    }, []);

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

                <Button>
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
                    {filteredVendors.length === 0 ? (
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
                                <Button className="mt-5">
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
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {vendor.email}
                                                    </span>

                                                    <span className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {vendor.phone}
                                                    </span>

                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {vendor.city},{" "}
                                                        {vendor.country}
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
                                                        Vendor actions
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    View Vendor
                                                </DropdownMenuItem>

                                                <DropdownMenuItem>
                                                    Edit Vendor
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem>
                                                    {vendor.isActive
                                                        ? "Deactivate Vendor"
                                                        : "Activate Vendor"}
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
        </div>
    );
}