"use client";

import { useMemo, useState } from "react";
import {
    FileText,
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Pencil,
    Download,
    CreditCard,
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
    | "Sent"
    | "Partially Paid"
    | "Paid"
    | "Overdue"
    | "Cancelled";

type SalesInvoice = {
    id: string;
    invoiceNumber: string;
    customerName: string;
    salesOrderNumber?: string;
    invoiceDate: string;
    dueDate: string;
    currency: string;
    totalAmount: number;
    paidAmount: number;
    status: InvoiceStatus;
};

const demoInvoices: SalesInvoice[] = [
    {
        id: "1",
        invoiceNumber: "INV-2026-001",
        customerName: "ABC Technologies Pvt Ltd",
        salesOrderNumber: "SO-2026-001",
        invoiceDate: "2026-08-10",
        dueDate: "2026-09-09",
        currency: "INR",
        totalAmount: 245000,
        paidAmount: 245000,
        status: "Paid",
    },
    {
        id: "2",
        invoiceNumber: "INV-2026-002",
        customerName: "Global Industrial Solutions",
        salesOrderNumber: "SO-2026-002",
        invoiceDate: "2026-08-12",
        dueDate: "2026-09-11",
        currency: "USD",
        totalAmount: 5800,
        paidAmount: 2500,
        status: "Partially Paid",
    },
    {
        id: "3",
        invoiceNumber: "INV-2026-003",
        customerName: "Bharat Engineering Works",
        salesOrderNumber: "SO-2026-003",
        invoiceDate: "2026-08-15",
        dueDate: "2026-09-14",
        currency: "INR",
        totalAmount: 128500,
        paidAmount: 0,
        status: "Sent",
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

function getStatusVariant(
    status: InvoiceStatus,
) {
    switch (status) {
        case "Paid":
            return "default";

        case "Partially Paid":
            return "secondary";

        case "Overdue":
            return "destructive";

        case "Cancelled":
            return "outline";

        default:
            return "secondary";
    }
}

export default function SalesInvoicesPage() {
    const [search, setSearch] = useState("");

    const filteredInvoices = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return demoInvoices;
        }

        return demoInvoices.filter(
            (invoice) =>
                invoice.invoiceNumber
                    .toLowerCase()
                    .includes(query) ||
                invoice.customerName
                    .toLowerCase()
                    .includes(query) ||
                invoice.salesOrderNumber
                    ?.toLowerCase()
                    .includes(query) ||
                invoice.status
                    .toLowerCase()
                    .includes(query),
        );
    }, [search]);

    const totalInvoiced = demoInvoices.reduce(
        (sum, invoice) =>
            sum + invoice.totalAmount,
        0,
    );

    const totalPaid = demoInvoices.reduce(
        (sum, invoice) =>
            sum + invoice.paidAmount,
        0,
    );

    const outstanding = demoInvoices.reduce(
        (sum, invoice) =>
            sum +
            (invoice.totalAmount -
                invoice.paidAmount),
        0,
    );

    const overdueInvoices = demoInvoices.filter(
        (invoice) =>
            invoice.status === "Overdue",
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Sales Invoices
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Create, manage, and track invoices
                        issued to your customers.
                    </p>
                </div>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                </Button>
            </div>

            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Invoiced
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹
                            {totalInvoiced.toLocaleString(
                                "en-IN",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Across all sales invoices
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Amount Received
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹
                            {totalPaid.toLocaleString(
                                "en-IN",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Payments received
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Outstanding
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹
                            {outstanding.toLocaleString(
                                "en-IN",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Amount yet to be received
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
                            Overdue invoices
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
                                Invoice Register
                            </CardTitle>

                            <CardDescription>
                                View and manage customer
                                invoices.
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
                    {filteredInvoices.length ===
                        0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No invoices found
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search term.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredInvoices.map(
                                (invoice) => {
                                    const balance =
                                        invoice.totalAmount -
                                        invoice.paidAmount;

                                    return (
                                        <div
                                            key={
                                                invoice.id
                                            }
                                            className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {
                                                            invoice.customerName
                                                        }
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                        <span>
                                                            Invoice:{" "}
                                                            {
                                                                invoice.invoiceDate
                                                            }
                                                        </span>

                                                        <span>
                                                            Due:{" "}
                                                            {
                                                                invoice.dueDate
                                                            }
                                                        </span>

                                                        {invoice.salesOrderNumber && (
                                                            <span>
                                                                Order:{" "}
                                                                {
                                                                    invoice.salesOrderNumber
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-6 lg:justify-end">
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        {formatAmount(
                                                            invoice.totalAmount,
                                                            invoice.currency,
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {balance >
                                                            0
                                                            ? `${formatAmount(
                                                                balance,
                                                                invoice.currency,
                                                            )} outstanding`
                                                            : "Fully paid"}
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
                                                                Invoice actions
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Invoice
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Invoice
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Download PDF
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem>
                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                            Record Payment
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}