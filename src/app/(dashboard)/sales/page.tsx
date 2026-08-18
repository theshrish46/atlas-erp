import Link from "next/link";
import {
    ArrowRight,
    FileText,
    Handshake,
    Receipt,
    ShoppingCart,
    TrendingUp,
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
import { Badge } from "@/components/ui/badge";

export default function SalesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Sales Overview
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Manage customers, orders, invoices,
                        payments, and your sales pipeline.
                    </p>
                </div>

                <Button asChild>
                    <Link href="/sales/orders">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        New Sales Order
                    </Link>
                </Button>
            </div>

            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Sales
                        </CardTitle>

                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹0.00
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Sales recorded this period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sales Orders
                        </CardTitle>

                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            0
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Orders placed by customers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Outstanding
                        </CardTitle>

                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹0.00
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Amount pending from customers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Customers
                        </CardTitle>

                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            0
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Active customers
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Workflow */}

            <Card>
                <CardHeader>
                    <CardTitle>
                        Sales Workflow
                    </CardTitle>

                    <CardDescription>
                        Follow the complete lifecycle of a
                        customer transaction.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                        <Link
                            href="/sales/quotations"
                            className="group rounded-xl border p-4 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Handshake className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Quotations
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Prepare and send quotations
                                to customers.
                            </p>
                        </Link>

                        <Link
                            href="/sales/orders"
                            className="group rounded-xl border p-4 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Sales Orders
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Track confirmed customer
                                orders.
                            </p>
                        </Link>

                        <Link
                            href="/sales/deliveries"
                            className="group rounded-xl border p-4 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Deliveries
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage dispatch and
                                customer deliveries.
                            </p>
                        </Link>

                        <Link
                            href="/sales/invoices"
                            className="group rounded-xl border p-4 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Receipt className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Invoices
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Create and manage customer
                                invoices.
                            </p>
                        </Link>

                        <Link
                            href="/sales/payments"
                            className="group rounded-xl border p-4 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <TrendingUp className="h-5 w-5" />
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                Payments
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Track payments received
                                from customers.
                            </p>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Customers
                        </CardTitle>

                        <CardDescription>
                            Manage the organizations and
                            individuals you sell to.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold">
                                0
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Customers
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            asChild
                        >
                            <Link href="/sales/customers">
                                Manage Customers
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Recent Activity
                        </CardTitle>

                        <CardDescription>
                            Your latest sales activity will
                            appear here.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="flex min-h-[100px] items-center justify-center rounded-lg border border-dashed">
                            <div className="text-center">
                                <Badge variant="secondary">
                                    No activity
                                </Badge>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Sales activity will appear
                                    here once transactions are
                                    recorded.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}