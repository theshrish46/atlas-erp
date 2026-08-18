"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
    ShoppingCart,
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

type PurchaseOrderStatus =
    | "draft"
    | "pending"
    | "approved"
    | "partially_received"
    | "received"
    | "cancelled";

type PurchaseOrder = {
    id: string;
    orderNumber: string;
    vendorName: string;
    orderDate: string;
    expectedDate: string | null;
    totalAmount: number;
    currency: string;
    status: PurchaseOrderStatus;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getStatusLabel(
    status: PurchaseOrderStatus,
) {
    switch (status) {
        case "draft":
            return "Draft";

        case "pending":
            return "Pending";

        case "approved":
            return "Approved";

        case "partially_received":
            return "Partially Received";

        case "received":
            return "Received";

        case "cancelled":
            return "Cancelled";

        default:
            return status;
    }
}

function getStatusVariant(
    status: PurchaseOrderStatus,
) {
    switch (status) {
        case "approved":
            return "default" as const;

        case "received":
            return "secondary" as const;

        case "cancelled":
            return "destructive" as const;

        default:
            return "outline" as const;
    }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PurchaseOrdersPage() {
    const [search, setSearch] = useState("");

    /*
     * Temporary data.
     *
     * This will be replaced with the Purchase Orders API after
     * the purchasing schema and workflow are finalized.
     */
    const [purchaseOrders] =
        useState<PurchaseOrder[]>([]);

    /* ---------------------------------------------------------------------- */
    /* Statistics                                                             */
    /* ---------------------------------------------------------------------- */

    const draftOrders = useMemo(() => {
        return purchaseOrders.filter(
            (order) => order.status === "draft",
        ).length;
    }, [purchaseOrders]);

    const pendingOrders = useMemo(() => {
        return purchaseOrders.filter(
            (order) =>
                order.status === "pending" ||
                order.status === "approved",
        ).length;
    }, [purchaseOrders]);

    const partiallyReceivedOrders = useMemo(() => {
        return purchaseOrders.filter(
            (order) =>
                order.status ===
                "partially_received",
        ).length;
    }, [purchaseOrders]);

    const totalPurchaseValue = useMemo(() => {
        return purchaseOrders.reduce(
            (total, order) =>
                total + order.totalAmount,
            0,
        );
    }, [purchaseOrders]);

    /* ---------------------------------------------------------------------- */
    /* Search                                                                 */
    /* ---------------------------------------------------------------------- */

    const filteredOrders = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return purchaseOrders;
        }

        return purchaseOrders.filter(
            (order) =>
                order.orderNumber
                    .toLowerCase()
                    .includes(query) ||
                order.vendorName
                    .toLowerCase()
                    .includes(query) ||
                getStatusLabel(order.status)
                    .toLowerCase()
                    .includes(query),
        );
    }, [purchaseOrders, search]);

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
                            Purchase Orders
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create, track, and manage orders placed with
                        your vendors.
                    </p>
                </div>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Purchase Order
                </Button>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Statistics                                                        */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Orders
                        </CardTitle>

                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {purchaseOrders.length}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Purchase orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Draft Orders
                        </CardTitle>

                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {draftOrders}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Not yet submitted
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Awaiting Fulfillment
                        </CardTitle>

                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingOrders}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Pending or approved
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Purchase Value
                        </CardTitle>

                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalPurchaseValue.toLocaleString(
                                "en-IN",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Total order value
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Purchase Order Directory                                          */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Purchase Order Directory
                            </CardTitle>

                            <CardDescription>
                                View and manage all purchase orders.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search purchase orders..."
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
                    {filteredOrders.length === 0 ? (
                        <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <FileText className="h-6 w-6" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                {search
                                    ? "No purchase orders found"
                                    : "No purchase orders yet"}
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                {search
                                    ? "Try searching with another order number, vendor, or status."
                                    : "Create your first purchase order to begin your purchasing workflow."}
                            </p>

                            {!search && (
                                <Button className="mt-5">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Purchase Order
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredOrders.map(
                                (order) => (
                                    <div
                                        key={order.id}
                                        className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <FileText className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </p>

                                                    <Badge
                                                        variant={getStatusVariant(
                                                            order.status,
                                                        )}
                                                    >
                                                        {getStatusLabel(
                                                            order.status,
                                                        )}
                                                    </Badge>
                                                </div>

                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {
                                                        order.vendorName
                                                    }
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        Ordered{" "}
                                                        {new Date(
                                                            order.orderDate,
                                                        ).toLocaleDateString()}
                                                    </span>

                                                    {order.expectedDate && (
                                                        <span>
                                                            Expected{" "}
                                                            {new Date(
                                                                order.expectedDate,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {order.currency}{" "}
                                                    {order.totalAmount.toLocaleString(
                                                        "en-IN",
                                                    )}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    Order value
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
                                                            Purchase order actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        View Purchase Order
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        Edit Purchase Order
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        Record Goods Received
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        Cancel Purchase Order
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/purchases/purchase-orders/${order.id}`}
                                                >
                                                    <ChevronRight className="h-4 w-4" />

                                                    <span className="sr-only">
                                                        Open purchase order
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
            {/* Purchasing Flow                                                   */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <CardTitle>
                        Purchase Order Lifecycle
                    </CardTitle>

                    <CardDescription>
                        Purchase orders will move through these stages
                        as the purchasing process progresses.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-3 md:grid-cols-5">
                        {[
                            "Draft",
                            "Pending",
                            "Approved",
                            "Partially Received",
                            "Received",
                        ].map(
                            (status, index) => (
                                <div
                                    key={status}
                                    className="relative rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            {index + 1}
                                        </div>

                                        <span className="text-sm font-medium">
                                            {status}
                                        </span>
                                    </div>

                                    {index <
                                        4 && (
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