"use client";

import { useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronRight,
    CircleDollarSign,
    Eye,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    ShoppingCart,
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

type SalesOrderStatus =
    | "Draft"
    | "Confirmed"
    | "Processing"
    | "Partially Delivered"
    | "Delivered"
    | "Cancelled";

type SalesOrder = {
    id: string;
    orderNumber: string;
    customerName: string;
    customerType: "Company" | "Individual";
    orderDate: string;
    expectedDeliveryDate: string;
    items: number;
    currency: string;
    total: number;
    status: SalesOrderStatus;
};

/* -------------------------------------------------------------------------- */
/* Temporary data                                                             */
/* -------------------------------------------------------------------------- */
/*
 * This is intentionally local mock data for the UI stage.
 *
 * Once the sales-order backend is ready, this will be replaced with:
 *
 * GET /api/sales/orders
 *
 * The structure is already designed around the future ERP model.
 */

const salesOrders: SalesOrder[] = [
    {
        id: "1",
        orderNumber: "SO-2026-0001",
        customerName: "Acme Industries Pvt Ltd",
        customerType: "Company",
        orderDate: "2026-08-12",
        expectedDeliveryDate: "2026-08-20",
        items: 8,
        currency: "INR",
        total: 485000,
        status: "Confirmed",
    },
    {
        id: "2",
        orderNumber: "SO-2026-0002",
        customerName: "Global Retail Solutions",
        customerType: "Company",
        orderDate: "2026-08-13",
        expectedDeliveryDate: "2026-08-25",
        items: 12,
        currency: "USD",
        total: 18500,
        status: "Processing",
    },
    {
        id: "3",
        orderNumber: "SO-2026-0003",
        customerName: "TechWorld GmbH",
        customerType: "Company",
        orderDate: "2026-08-14",
        expectedDeliveryDate: "2026-08-28",
        items: 5,
        currency: "EUR",
        total: 12750,
        status: "Partially Delivered",
    },
    {
        id: "4",
        orderNumber: "SO-2026-0004",
        customerName: "Rajesh Kumar",
        customerType: "Individual",
        orderDate: "2026-08-15",
        expectedDeliveryDate: "2026-08-18",
        items: 3,
        currency: "INR",
        total: 42000,
        status: "Delivered",
    },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatAmount(
    amount: number,
    currency: string,
) {
    try {
        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency,
                maximumFractionDigits: 2,
            },
        ).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString()}`;
    }
}

function getStatusVariant(
    status: SalesOrderStatus,
) {
    switch (status) {
        case "Confirmed":
        case "Delivered":
            return "default" as const;

        case "Processing":
        case "Partially Delivered":
            return "secondary" as const;

        case "Cancelled":
            return "destructive" as const;

        default:
            return "outline" as const;
    }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function SalesOrdersPage() {
    const [search, setSearch] = useState("");

    const filteredOrders = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return salesOrders;
        }

        return salesOrders.filter(
            (order) =>
                order.orderNumber
                    .toLowerCase()
                    .includes(query) ||
                order.customerName
                    .toLowerCase()
                    .includes(query) ||
                order.customerType
                    .toLowerCase()
                    .includes(query) ||
                order.status
                    .toLowerCase()
                    .includes(query) ||
                order.currency
                    .toLowerCase()
                    .includes(query),
        );
    }, [search]);

    const confirmedOrders =
        salesOrders.filter(
            (order) =>
                order.status ===
                "Confirmed" ||
                order.status ===
                "Processing" ||
                order.status ===
                "Partially Delivered",
        ).length;

    const deliveredOrders =
        salesOrders.filter(
            (order) =>
                order.status === "Delivered",
        ).length;

    const pendingOrders =
        salesOrders.filter(
            (order) =>
                order.status !== "Delivered" &&
                order.status !== "Cancelled",
        ).length;

    const totalOrderValue =
        salesOrders.reduce(
            (total, order) => {
                /*
                 * This is only suitable for the UI mock.
                 *
                 * We must NOT aggregate different currencies
                 * together in the real implementation.
                 */
                if (order.currency === "INR") {
                    return total + order.total;
                }

                return total;
            },
            0,
        );

    return (
        <div className="space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* Header                                                           */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Sales Orders
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Manage customer orders, fulfillment,
                        deliveries, and order status.
                    </p>
                </div>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Sales Order
                </Button>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Statistics                                                       */}
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
                            {salesOrders.length}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Sales orders created
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Orders
                        </CardTitle>

                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {confirmedOrders}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Orders being processed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Delivered
                        </CardTitle>

                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {deliveredOrders}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Orders fully delivered
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            INR Order Value
                        </CardTitle>

                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatAmount(
                                totalOrderValue,
                                "INR",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            INR orders only
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Order Directory                                                  */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Sales Order Directory
                            </CardTitle>

                            <CardDescription>
                                View and manage customer
                                sales orders.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search orders..."
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

                <CardContent className="p-0">
                    {filteredOrders.length ===
                        0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No sales orders found
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search term.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredOrders.map(
                                (order) => (
                                    <div
                                        key={
                                            order.id
                                        }
                                        className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        {/* Order Information */}

                                        <div className="flex min-w-0 items-start gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <ShoppingCart className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold">
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </p>

                                                    <Badge
                                                        variant={getStatusVariant(
                                                            order.status,
                                                        )}
                                                    >
                                                        {
                                                            order.status
                                                        }
                                                    </Badge>
                                                </div>

                                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {
                                                            order.customerName
                                                        }
                                                    </span>

                                                    <span className="text-muted-foreground">
                                                        {
                                                            order.customerType
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        Ordered{" "}
                                                        {new Date(
                                                            order.orderDate,
                                                        ).toLocaleDateString()}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <Package className="h-3.5 w-3.5" />
                                                        {
                                                            order.items
                                                        }{" "}
                                                        items
                                                    </span>

                                                    <span>
                                                        Expected{" "}
                                                        {new Date(
                                                            order.expectedDeliveryDate,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount + Actions */}

                                        <div className="flex items-center justify-between gap-6 lg:justify-end">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">
                                                    Order Total
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {formatAmount(
                                                        order.total,
                                                        order.currency,
                                                    )}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        order.currency
                                                    }
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
                                                            Sales
                                                            order
                                                            actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Order
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        Edit Order
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        Create Delivery
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        Create Invoice
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        View Customer
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        {order.status ===
                                                            "Cancelled"
                                                            ? "Restore Order"
                                                            : "Cancel Order"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* Order Flow                                                       */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <CardTitle>
                        Order Lifecycle
                    </CardTitle>

                    <CardDescription>
                        How a sales order moves through the
                        ERP.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        {[
                            "Draft",
                            "Confirmed",
                            "Processing",
                            "Delivered",
                            "Invoiced",
                            "Paid",
                        ].map(
                            (
                                status,
                                index,
                            ) => (
                                <div
                                    key={status}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-medium">
                                        {index + 1}
                                    </div>

                                    <span className="text-sm font-medium">
                                        {status}
                                    </span>

                                    {index <
                                        5 && (
                                            <ChevronRight className="hidden h-4 w-4 text-muted-foreground md:block" />
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