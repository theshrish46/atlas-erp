"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    FileText,
    MoreHorizontal,
    PackageCheck,
    Plus,
    Search,
    Truck,
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

type GoodsReceivedStatus =
    | "draft"
    | "received"
    | "partially_received"
    | "accepted"
    | "rejected";

type GoodsReceivedNote = {
    id: string;
    grnNumber: string;
    purchaseOrderNumber: string;
    vendorName: string;
    receivedDate: string;
    totalItems: number;
    receivedItems: number;
    status: GoodsReceivedStatus;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getStatusLabel(
    status: GoodsReceivedStatus,
) {
    switch (status) {
        case "draft":
            return "Draft";

        case "received":
            return "Received";

        case "partially_received":
            return "Partially Received";

        case "accepted":
            return "Accepted";

        case "rejected":
            return "Rejected";

        default:
            return status;
    }
}

function getStatusVariant(
    status: GoodsReceivedStatus,
) {
    switch (status) {
        case "accepted":
            return "default" as const;

        case "received":
            return "secondary" as const;

        case "rejected":
            return "destructive" as const;

        default:
            return "outline" as const;
    }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function GoodsReceivedNotesPage() {
    const [search, setSearch] = useState("");

    /*
     * Temporary data.
     *
     * This will be replaced with the GRN API after the purchasing,
     * inventory, and purchase-order schemas are finalized.
     */
    const [goodsReceivedNotes] =
        useState<GoodsReceivedNote[]>([]);

    /* ---------------------------------------------------------------------- */
    /* Statistics                                                             */
    /* ---------------------------------------------------------------------- */

    const totalNotes =
        goodsReceivedNotes.length;

    const receivedNotes = useMemo(() => {
        return goodsReceivedNotes.filter(
            (grn) =>
                grn.status === "received" ||
                grn.status === "accepted",
        ).length;
    }, [goodsReceivedNotes]);

    const partiallyReceivedNotes = useMemo(() => {
        return goodsReceivedNotes.filter(
            (grn) =>
                grn.status ===
                "partially_received",
        ).length;
    }, [goodsReceivedNotes]);

    const pendingInspection = useMemo(() => {
        return goodsReceivedNotes.filter(
            (grn) => grn.status === "received",
        ).length;
    }, [goodsReceivedNotes]);

    /* ---------------------------------------------------------------------- */
    /* Search                                                                 */
    /* ---------------------------------------------------------------------- */

    const filteredNotes = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return goodsReceivedNotes;
        }

        return goodsReceivedNotes.filter(
            (grn) =>
                grn.grnNumber
                    .toLowerCase()
                    .includes(query) ||
                grn.purchaseOrderNumber
                    .toLowerCase()
                    .includes(query) ||
                grn.vendorName
                    .toLowerCase()
                    .includes(query) ||
                getStatusLabel(grn.status)
                    .toLowerCase()
                    .includes(query),
        );
    }, [goodsReceivedNotes, search]);

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
                            Goods Received Notes
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Record and track goods received against purchase
                        orders.
                    </p>
                </div>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create GRN
                </Button>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Statistics                                                        */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total GRNs
                        </CardTitle>

                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalNotes}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Goods received notes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Received
                        </CardTitle>

                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {receivedNotes}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Successfully received
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Partial Receipts
                        </CardTitle>

                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {partiallyReceivedNotes}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Awaiting remaining items
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Inspection
                        </CardTitle>

                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingInspection}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Awaiting acceptance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* GRN Directory                                                     */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Goods Received Notes
                            </CardTitle>

                            <CardDescription>
                                View and manage goods received from
                                vendors.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search GRNs..."
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
                    {filteredNotes.length === 0 ? (
                        <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <PackageCheck className="h-6 w-6" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                {search
                                    ? "No GRNs found"
                                    : "No goods received yet"}
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                {search
                                    ? "Try searching with another GRN number, purchase order, vendor, or status."
                                    : "Create a goods received note when products arrive from a vendor against a purchase order."}
                            </p>

                            {!search && (
                                <Button className="mt-5">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create GRN
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredNotes.map(
                                (grn) => (
                                    <div
                                        key={grn.id}
                                        className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <PackageCheck className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {
                                                            grn.grnNumber
                                                        }
                                                    </p>

                                                    <Badge
                                                        variant={getStatusVariant(
                                                            grn.status,
                                                        )}
                                                    >
                                                        {getStatusLabel(
                                                            grn.status,
                                                        )}
                                                    </Badge>
                                                </div>

                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {
                                                        grn.vendorName
                                                    }
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        PO{" "}
                                                        {
                                                            grn.purchaseOrderNumber
                                                        }
                                                    </span>

                                                    <span>
                                                        Received{" "}
                                                        {new Date(
                                                            grn.receivedDate,
                                                        ).toLocaleDateString()}
                                                    </span>

                                                    <span>
                                                        {
                                                            grn.receivedItems
                                                        }{" "}
                                                        /{" "}
                                                        {
                                                            grn.totalItems
                                                        }{" "}
                                                        items
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">
                                                    {
                                                        grn.receivedItems
                                                    }{" "}
                                                    /{" "}
                                                    {
                                                        grn.totalItems
                                                    }
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    Items received
                                                </p>
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
                                                            GRN actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        View GRN
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        Edit GRN
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        View Purchase Order
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        Accept Goods
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                        Reject Goods
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/purchases/goods-received-notes/${grn.id}`}
                                                >
                                                    <ChevronRight className="h-4 w-4" />

                                                    <span className="sr-only">
                                                        Open GRN
                                                    </span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* GRN Workflow                                                      */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <CardTitle>
                        Goods Receiving Workflow
                    </CardTitle>

                    <CardDescription>
                        A GRN records the actual goods received rather
                        than simply what was ordered.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-3 md:grid-cols-4">
                        {[
                            "Purchase Order",
                            "Goods Arrive",
                            "Record GRN",
                            "Accept & Update Inventory",
                        ].map(
                            (step, index) => (
                                <div
                                    key={step}
                                    className="relative rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            {index + 1}
                                        </div>

                                        <span className="text-sm font-medium">
                                            {step}
                                        </span>
                                    </div>

                                    {index <
                                        3 && (
                                            <ChevronRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 bg-background text-muted-foreground md:block" />
                                        )}
                                </div>
                            ),
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}