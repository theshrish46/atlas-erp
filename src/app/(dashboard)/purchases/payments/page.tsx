"use client";

import { useMemo, useState } from "react";
import {
    ArrowDownToLine,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    Wallet,
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
    | "Pending"
    | "Completed"
    | "Failed"
    | "Cancelled";

type PaymentMethod =
    | "Bank Transfer"
    | "UPI"
    | "Cheque"
    | "Cash"
    | "Credit Card"
    | "Other";

type PurchasePayment = {
    id: string;
    paymentNumber: string;
    vendor: string;
    invoiceNumber: string;
    paymentDate: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    referenceNumber?: string;
};

const payments: PurchasePayment[] = [
    {
        id: "1",
        paymentNumber: "PAY-2026-001",
        vendor: "ABC Technologies Pvt Ltd",
        invoiceNumber: "INV-2026-001",
        paymentDate: "2026-08-15",
        amount: 150000,
        currency: "INR",
        method: "Bank Transfer",
        status: "Completed",
        referenceNumber: "NEFT-847392",
    },
    {
        id: "2",
        paymentNumber: "PAY-2026-002",
        vendor: "Global Components Ltd",
        invoiceNumber: "INV-2026-002",
        paymentDate: "2026-08-14",
        amount: 100000,
        currency: "INR",
        method: "Bank Transfer",
        status: "Completed",
        referenceNumber: "NEFT-928471",
    },
    {
        id: "3",
        paymentNumber: "PAY-2026-003",
        vendor: "TechSource International",
        invoiceNumber: "INV-2026-003",
        paymentDate: "2026-08-18",
        amount: 4250,
        currency: "USD",
        method: "Bank Transfer",
        status: "Pending",
        referenceNumber: "WIRE-293847",
    },
    {
        id: "4",
        paymentNumber: "PAY-2026-004",
        vendor: "Bangalore Industrial Supplies",
        invoiceNumber: "INV-2026-004",
        paymentDate: "2026-08-12",
        amount: 96000,
        currency: "INR",
        method: "UPI",
        status: "Completed",
        referenceNumber: "UPI-837291",
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

function getStatusVariant(status: PaymentStatus) {
    switch (status) {
        case "Completed":
            return "default";

        case "Failed":
            return "destructive";

        case "Cancelled":
            return "secondary";

        case "Pending":
            return "outline";

        default:
            return "secondary";
    }
}

export default function PurchasePaymentsPage() {
    const [search, setSearch] = useState("");

    const filteredPayments = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return payments;
        }

        return payments.filter((payment) =>
            [
                payment.paymentNumber,
                payment.vendor,
                payment.invoiceNumber,
                payment.method,
                payment.status,
                payment.currency,
                payment.referenceNumber ?? "",
            ]
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    }, [search]);

    const completedPayments = payments.filter(
        (payment) =>
            payment.status === "Completed",
    ).length;

    const pendingPayments = payments.filter(
        (payment) =>
            payment.status === "Pending",
    ).length;

    const totalPaymentCount = payments.length;

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Payments
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Record and track payments made to
                        your vendors.
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
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Payments
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalPaymentCount}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Payment transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Completed
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completedPayments}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Successfully processed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingPayments}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Awaiting confirmation
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Payment Accounts
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-muted-foreground" />

                            <span className="text-sm font-medium">
                                Manage accounts
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Banks, cash and other payment
                            sources
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Directory */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Payment History
                            </CardTitle>

                            <CardDescription>
                                View payments made against
                                purchase invoices.
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
                    {filteredPayments.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Wallet className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No payments found
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search
                                    term.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredPayments.map(
                                (payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Wallet className="h-5 w-5" />
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

                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {
                                                        payment.vendor
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Invoice:{" "}
                                                    {
                                                        payment.invoiceNumber
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3 lg:flex lg:items-center">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Payment Date
                                                </p>

                                                <p className="mt-1 font-medium">
                                                    {new Date(
                                                        payment.paymentDate,
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Method
                                                </p>

                                                <p className="mt-1 font-medium">
                                                    {
                                                        payment.method
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Amount
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {formatAmount(
                                                        payment.amount,
                                                        payment.currency,
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
                                                            Payment
                                                            actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Payment
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        <ArrowDownToLine className="mr-2 h-4 w-4" />
                                                        Download Receipt
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        View Invoice
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