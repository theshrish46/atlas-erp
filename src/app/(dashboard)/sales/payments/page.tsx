"use client";

import { useMemo, useState } from "react";
import {
    ArrowDownLeft,
    CreditCard,
    Download,
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

type PaymentStatus =
    | "Received"
    | "Pending"
    | "Failed"
    | "Refunded";

type PaymentMethod =
    | "Bank Transfer"
    | "Cash"
    | "Cheque"
    | "Card"
    | "UPI"
    | "Other";

type SalesPayment = {
    id: string;
    paymentNumber: string;
    customerName: string;
    invoiceNumber?: string;
    paymentDate: string;
    currency: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    status: PaymentStatus;
};

const demoPayments: SalesPayment[] = [
    {
        id: "1",
        paymentNumber: "PAY-2026-001",
        customerName: "ABC Technologies Pvt Ltd",
        invoiceNumber: "INV-2026-001",
        paymentDate: "2026-08-12",
        currency: "INR",
        amount: 245000,
        method: "Bank Transfer",
        reference: "NEFT-829374",
        status: "Received",
    },
    {
        id: "2",
        paymentNumber: "PAY-2026-002",
        customerName: "Global Industrial Solutions",
        invoiceNumber: "INV-2026-002",
        paymentDate: "2026-08-15",
        currency: "USD",
        amount: 2500,
        method: "Bank Transfer",
        reference: "SWIFT-293847",
        status: "Received",
    },
    {
        id: "3",
        paymentNumber: "PAY-2026-003",
        customerName: "Bharat Engineering Works",
        invoiceNumber: "INV-2026-003",
        paymentDate: "2026-08-18",
        currency: "INR",
        amount: 50000,
        method: "UPI",
        reference: "UPI-829384",
        status: "Pending",
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
    status: PaymentStatus,
) {
    switch (status) {
        case "Received":
            return "default";

        case "Failed":
            return "destructive";

        case "Refunded":
            return "outline";

        default:
            return "secondary";
    }
}

export default function SalesPaymentsPage() {
    const [search, setSearch] = useState("");

    const filteredPayments = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return demoPayments;
        }

        return demoPayments.filter(
            (payment) =>
                payment.paymentNumber
                    .toLowerCase()
                    .includes(query) ||
                payment.customerName
                    .toLowerCase()
                    .includes(query) ||
                payment.invoiceNumber
                    ?.toLowerCase()
                    .includes(query) ||
                payment.method
                    .toLowerCase()
                    .includes(query) ||
                payment.status
                    .toLowerCase()
                    .includes(query) ||
                payment.reference
                    ?.toLowerCase()
                    .includes(query),
        );
    }, [search]);

    const receivedPayments =
        demoPayments.filter(
            (payment) =>
                payment.status === "Received",
        );

    const pendingPayments =
        demoPayments.filter(
            (payment) =>
                payment.status === "Pending",
        );

    const totalReceived =
        receivedPayments.reduce(
            (sum, payment) =>
                sum + payment.amount,
            0,
        );

    const totalPending =
        pendingPayments.reduce(
            (sum, payment) =>
                sum + payment.amount,
            0,
        );

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Payments
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Record and track payments received
                        from your customers.
                    </p>
                </div>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                </Button>
            </div>

            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Payments
                        </CardTitle>

                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {demoPayments.length}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Payment transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Received
                        </CardTitle>

                        <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹
                            {totalReceived.toLocaleString(
                                "en-IN",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Successfully received
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹
                            {totalPending.toLocaleString(
                                "en-IN",
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Pending payment transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Customers Paid
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {
                                new Set(
                                    receivedPayments.map(
                                        (payment) =>
                                            payment.customerName,
                                    ),
                                ).size
                            }
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Customers with received payments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Register */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Payment Register
                            </CardTitle>

                            <CardDescription>
                                View customer payment
                                transactions and their
                                associated invoices.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search payments..."
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
                    {filteredPayments.length ===
                        0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No payments found
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search term.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredPayments.map(
                                (payment) => (
                                    <div
                                        key={
                                            payment.id
                                        }
                                        className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <CreditCard className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {
                                                            payment.paymentNumber
                                                        }
                                                    </p>

                                                    <Badge
                                                        variant={getStatusVariant(
                                                            payment.status,
                                                        )}
                                                    >
                                                        {
                                                            payment.status
                                                        }
                                                    </Badge>
                                                </div>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {
                                                        payment.customerName
                                                    }
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        Date:{" "}
                                                        {
                                                            payment.paymentDate
                                                        }
                                                    </span>

                                                    <span>
                                                        Method:{" "}
                                                        {
                                                            payment.method
                                                        }
                                                    </span>

                                                    {payment.invoiceNumber && (
                                                        <span>
                                                            Invoice:{" "}
                                                            {
                                                                payment.invoiceNumber
                                                            }
                                                        </span>
                                                    )}

                                                    {payment.reference && (
                                                        <span>
                                                            Ref:{" "}
                                                            {
                                                                payment.reference
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
                                                        payment.amount,
                                                        payment.currency,
                                                    )}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        payment.method
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
                                                            Payment actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Payment
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Invoice
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download Receipt
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