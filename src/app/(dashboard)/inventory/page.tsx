"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    Boxes,
    MoreHorizontal,
    PackageCheck,
    Search,
    Warehouse,
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StockStatus =
    | "In Stock"
    | "Low Stock"
    | "Out of Stock";

type InventoryItem = {
    id: string;
    sku: string;
    name: string;
    category: string;
    warehouse: string;
    quantity: number;
    reorderLevel: number;
    unit: string;
    status: StockStatus;
};

const demoInventory: InventoryItem[] = [
    {
        id: "1",
        sku: "PRD-001",
        name: "Industrial Motor 5HP",
        category: "Electrical",
        warehouse: "Main Warehouse",
        quantity: 48,
        reorderLevel: 10,
        unit: "pcs",
        status: "In Stock",
    },
    {
        id: "2",
        sku: "PRD-002",
        name: "Conveyor Belt 10M",
        category: "Mechanical",
        warehouse: "Main Warehouse",
        quantity: 8,
        reorderLevel: 10,
        unit: "pcs",
        status: "Low Stock",
    },
    {
        id: "3",
        sku: "PRD-003",
        name: "Bearing 6205",
        category: "Mechanical",
        warehouse: "Spare Parts",
        quantity: 125,
        reorderLevel: 25,
        unit: "pcs",
        status: "In Stock",
    },
    {
        id: "4",
        sku: "PRD-004",
        name: "Control Panel Assembly",
        category: "Electrical",
        warehouse: "Main Warehouse",
        quantity: 0,
        reorderLevel: 5,
        unit: "pcs",
        status: "Out of Stock",
    },
    {
        id: "5",
        sku: "PRD-005",
        name: "PVC Conveyor Roller",
        category: "Mechanical",
        warehouse: "Spare Parts",
        quantity: 6,
        reorderLevel: 10,
        unit: "pcs",
        status: "Low Stock",
    },
];

function getStatusVariant(
    status: StockStatus,
) {
    switch (status) {
        case "In Stock":
            return "default";

        case "Out of Stock":
            return "destructive";

        case "Low Stock":
            return "secondary";
    }
}

export default function InventoryPage() {
    const [search, setSearch] = useState("");

    const filteredInventory = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return demoInventory;
        }

        return demoInventory.filter(
            (item) =>
                item.name
                    .toLowerCase()
                    .includes(query) ||
                item.sku
                    .toLowerCase()
                    .includes(query) ||
                item.category
                    .toLowerCase()
                    .includes(query) ||
                item.warehouse
                    .toLowerCase()
                    .includes(query),
        );
    }, [search]);

    const totalItems =
        demoInventory.length;

    const lowStockItems =
        demoInventory.filter(
            (item) =>
                item.status === "Low Stock",
        ).length;

    const outOfStockItems =
        demoInventory.filter(
            (item) =>
                item.status === "Out of Stock",
        ).length;

    const totalQuantity =
        demoInventory.reduce(
            (total, item) =>
                total + item.quantity,
            0,
        );

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Inventory
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Monitor stock levels across your
                        warehouses and manage inventory.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">
                        <ArrowDownLeft className="mr-2 h-4 w-4" />
                        Stock In
                    </Button>

                    <Button>
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Stock Out
                    </Button>
                </div>
            </div>

            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Products
                        </CardTitle>

                        <Boxes className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalItems}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Products tracked in inventory
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Quantity
                        </CardTitle>

                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalQuantity.toLocaleString(
                                "en-IN",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Units currently available
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock
                        </CardTitle>

                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {lowStockItems}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Products below reorder level
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Out of Stock
                        </CardTitle>

                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {outOfStockItems}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Products requiring replenishment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Register */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Inventory Overview
                            </CardTitle>

                            <CardDescription>
                                View current stock levels,
                                warehouses, and reorder
                                status.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search inventory..."
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
                    {filteredInventory.length ===
                        0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Boxes className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No inventory found
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search term.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredInventory.map(
                                (item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <Boxes className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {item.name}
                                                    </p>

                                                    <Badge
                                                        variant={getStatusVariant(
                                                            item.status,
                                                        )}
                                                    >
                                                        {
                                                            item.status
                                                        }
                                                    </Badge>
                                                </div>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    SKU:{" "}
                                                    {item.sku}
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        {
                                                            item.category
                                                        }
                                                    </span>

                                                    <span>
                                                        {
                                                            item.warehouse
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-6 lg:justify-end">
                                            <div className="text-right">
                                                <p className="text-lg font-semibold">
                                                    {item.quantity.toLocaleString(
                                                        "en-IN",
                                                    )}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {item.unit}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">
                                                    Reorder Level
                                                </p>

                                                <p className="font-medium">
                                                    {
                                                        item.reorderLevel
                                                    }{" "}
                                                    {
                                                        item.unit
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
                                                            Inventory actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        View Product
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        View Stock
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        Stock Adjustment
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
        </div>
    );
}