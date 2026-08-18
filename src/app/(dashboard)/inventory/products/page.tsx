"use client";

import {
    Package,
    Plus,
    Search,
    MoreHorizontal,
    Download,
    Upload,
    SlidersHorizontal,
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

import { Separator } from "@/components/ui/separator";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProductsPage() {
    return (<div className="space-y-6">

        ```
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Products
                </h1>

                <p className="mt-1 text-muted-foreground">
                    Manage your products, pricing, units, and inventory
                    information.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>

                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>

            </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Statistics                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Products
                    </CardTitle>

                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                    <div className="text-2xl font-bold">
                        0
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Products in your catalog
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Products
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="text-2xl font-bold">
                        0
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Currently available products
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Low Stock
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="text-2xl font-bold">
                        0
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
                </CardHeader>

                <CardContent>
                    <div className="text-2xl font-bold">
                        0
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Products currently unavailable
                    </p>
                </CardContent>
            </Card>

        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Product Directory                                                */}
        {/* ---------------------------------------------------------------- */}

        <Card>

            <CardHeader>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <CardTitle>
                            Product Catalog
                        </CardTitle>

                        <CardDescription>
                            View and manage all products maintained in
                            your inventory.
                        </CardDescription>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">

                        <div className="relative w-full sm:w-80">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search products..."
                            />

                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                        >
                            <SlidersHorizontal className="h-4 w-4" />

                            <span className="sr-only">
                                Filter products
                            </span>
                        </Button>

                    </div>

                </div>

            </CardHeader>

            <Separator />

            <CardContent className="p-0">

                {/* -------------------------------------------------------- */}
                {/* Empty State                                               */}
                {/* -------------------------------------------------------- */}

                <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-6 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Package className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="max-w-md">

                        <h3 className="font-semibold">
                            No products yet
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Add products to start managing your catalog,
                            inventory levels, purchasing, and sales.
                        </p>

                    </div>

                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>

                </div>

            </CardContent>

        </Card>

    </div>
    );
}
