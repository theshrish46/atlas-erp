"use client";

import { useMemo, useState } from "react";
import {
    ArrowDownToLine,
    Eye,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
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

type InvoiceStatus =
    | "Draft"
    | "Received"
    | "Partially Paid"
    | "Paid"
    | "Overdue"
    | "Cancelled";

type PurchaseInvoice = {
    id: string;
    invoiceNumber: string;
    vendor: string;
    purchaseOrder: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
    currency: string;
    status: InvoiceStatus;
};

const invoices: PurchaseInvoice[] = [
    {
        id: "1",
        invoiceNumber: "INV-2026-001",
        vendor: "ABC Technologies Pvt Ltd",
        purchaseOrder: "PO-2026-001",
        invoiceDate: "2026-08-12",
        dueDate: "2026-09-11",
        amount: 245000,
        currency: "INR",
        status: "Received",
    },
    {
        id: "2",
        invoiceNumber: "INV-2026-002",
        vendor: "Global Components Ltd",
        purchaseOrder: "PO-2026-002",
        invoiceDate: "2026-08-10",
        dueDate: "2026-09-09",
        amount: 182500,
        currency: "INR",
        status: "Partially Paid",
    },
    {
        id: "3",
        invoiceNumber: "INV-2026-003",
        vendor: "TechSource International",
        purchaseOrder: "PO-2026-004",
        invoiceDate: "2026-08-05",
        dueDate: "2026-08-20",
        amount: 4250,
        currency: "USD",
        status: "Overdue",
    },
    {
        id: "4",
        invoiceNumber: "INV-2026-004",
        vendor: "Bangalore Industrial Supplies",
        purchaseOrder: "PO-2026-005",
        invoiceDate: "2026-08-01",
        dueDate: "2026-08-31",
        amount: 96000,
        currency: "INR",
        status: "Paid",
    },
];

function formatAmount(
    amount: number,
    currency: string,
) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}

function getStatusVariant(status: InvoiceStatus) {
    switch (status) {
        case "Paid":
            return "default";

        case "Overdue":
            return "destructive";

        case "Cancelled":
            return "secondary";

        case "Partially Paid":
            return "outline";

        default:
            return "secondary";
    }
}

export default function PurchaseInvoicesPage() {
    const [search, setSearch] = useState("");

    const filteredInvoices = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return invoices;
        }

        return invoices.filter((invoice) =>
            [
                invoice.invoiceNumber,
                invoice.vendor,
                invoice.purchaseOrder,
                invoice.status,
                invoice.currency,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    }, [search]);

    const totalInvoices = invoices.length;

    const totalReceived = invoices
        .filter(
            (invoice) =>
                invoice.status !== "Cancelled",
        )
        .reduce(
            (total, invoice) =>
                total + invoice.amount,
            0,
        );

    const paidInvoices = invoices.filter(
        (invoice) =>
            invoice.status === "Paid",
    ).length;

    const overdueInvoices = invoices.filter(
        (invoice) =>
            invoice.status === "Overdue",
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Purchase Invoices
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Manage vendor invoices, payments,
                        and purchase-related billing.
                    </p>
                </div>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Invoice
                </Button>
            </div>

            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Invoices
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalInvoices}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Vendor invoices recorded
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Invoice Value
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹
                            {totalReceived.toLocaleString(
                                "en-IN",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Excluding cancelled invoices
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Paid
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {paidInvoices}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Fully paid invoices
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Overdue
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {overdueInvoices}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Require payment attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Directory */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Invoice Directory
                            </CardTitle>

                            <CardDescription>
                                View and manage invoices
                                received from vendors.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search invoices..."
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
                    {filteredInvoices.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No invoices found
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search
                                    term.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredInvoices.map(
                                (invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <FileText className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {
                                                            invoice.invoiceNumber
                                                        }
                                                    </p>

                                                    <Badge
                                                        variant={getStatusVariant(
                                                            invoice.status,
                                                        )}
                                                    >
                                                        {
                                                            invoice.status
                                                        }
                                                    </Badge>
                                                </div>

                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {
                                                        invoice.vendor
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    PO:{" "}
                                                    {
                                                        invoice.purchaseOrder
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3 lg:flex lg:items-center">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Invoice Date
                                                </p>

                                                <p className="mt-1 font-medium">
                                                    {new Date(
                                                        invoice.invoiceDate,
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Due Date
                                                </p>

                                                <p className="mt-1 font-medium">
                                                    {new Date(
                                                        invoice.dueDate,
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Amount
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {formatAmount(
                                                        invoice.amount,
                                                        invoice.currency,
                                                    )}
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
                                                            Invoice
                                                            actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Invoice
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        <ArrowDownToLine className="mr-2 h-4 w-4" />
                                                        Download
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        Record Payment
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