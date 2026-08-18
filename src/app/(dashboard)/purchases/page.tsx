import Link from "next/link";
import {
    ArrowRight,
    FileText,
    PackageCheck,
    Receipt,
    ShoppingCart,
    Store,
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

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PurchasesPage() {
    return (
        <div className="space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* Overview Header                                                   */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                        Purchasing Overview
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your purchasing workflow from vendors to
                        received goods and invoices.
                    </p>
                </div>

                <Button asChild>
                    <Link href="/purchases/purchase-orders">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Create Purchase Order
                    </Link>
                </Button>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Statistics                                                        */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Purchase Orders
                        </CardTitle>

                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            0
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Orders created
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Orders
                        </CardTitle>

                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            0
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Awaiting fulfillment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Goods Received
                        </CardTitle>

                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            0
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Goods received
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Purchase Invoices
                        </CardTitle>

                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            0
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Invoices recorded
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Purchasing Workflow                                               */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <CardTitle>Purchasing Workflow</CardTitle>

                    <CardDescription>
                        Follow the purchasing process from supplier selection
                        to inventory receipt.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        {/* Vendors */}

                        <Link
                            href="/purchases/vendors"
                            className="group rounded-xl border p-5 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Store className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Vendors
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage suppliers and vendor information.
                            </p>
                        </Link>

                        {/* Purchase Orders */}

                        <Link
                            href="/purchases/purchase-orders"
                            className="group rounded-xl border p-5 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Purchase Orders
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Create and track orders placed with vendors.
                            </p>
                        </Link>

                        {/* Goods Received */}

                        <Link
                            href="/purchases/goods-received-notes"
                            className="group rounded-xl border p-5 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <PackageCheck className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Goods Received
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Record goods received against purchase orders.
                            </p>
                        </Link>

                        {/* Invoices */}

                        <Link
                            href="/purchases/invoices"
                            className="group rounded-xl border p-5 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Receipt className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Purchase Invoices
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage vendor invoices and payment status.
                            </p>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* Recent Purchasing Activity                                       */}
            {/* ---------------------------------------------------------------- */}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Purchasing Activity</CardTitle>

                            <CardDescription>
                                Recent purchase orders, receipts, and invoices.
                            </CardDescription>
                        </div>

                        <Badge variant="outline">
                            No activity
                        </Badge>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="flex min-h-[180px] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <p className="mt-3 font-medium">
                            No purchasing activity yet
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Create your first purchase order to get started.
                        </p>

                        <Button
                            asChild
                            variant="outline"
                            className="mt-4"
                        >
                            <Link href="/purchases/purchase-orders">
                                Create Purchase Order
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}