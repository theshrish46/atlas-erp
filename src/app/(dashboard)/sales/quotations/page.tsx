"use client";

import { useMemo, useState } from "react";
import {
    Download,
    Eye,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
    Send,
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

type QuotationStatus =
    | "Draft"
    | "Sent"
    | "Accepted"
    | "Rejected"
    | "Expired"
    | "Converted";

type Quotation = {
    id: string;
    quotationNumber: string;
    customerName: string;
    quotationDate: string;
    validUntil: string;
    currency: string;
    totalAmount: number;
    status: QuotationStatus;
};

const demoQuotations: Quotation[] = [
    {
        id: "1",
        quotationNumber: "QT-2026-001",
        customerName: "ABC Technologies Pvt Ltd",
        quotationDate: "2026-08-10",
        validUntil: "2026-09-09",
        currency: "INR",
        totalAmount: 285000,
        status: "Sent",
    },
    {
        id: "2",
        quotationNumber: "QT-2026-002",
        customerName: "Global Industrial Solutions",
        quotationDate: "2026-08-12",
        validUntil: "2026-09-11",
        currency: "USD",
        totalAmount: 7500,
        status: "Accepted",
    },
    {
        id: "3",
        quotationNumber: "QT-2026-003",
        customerName: "Bharat Engineering Works",
        quotationDate: "2026-08-15",
        validUntil: "2026-08-30",
        currency: "INR",
        totalAmount: 145000,
        status: "Draft",
    },
    {
        id: "4",
        quotationNumber: "QT-2026-004",
        customerName: "Precision Manufacturing Ltd",
        quotationDate: "2026-08-05",
        validUntil: "2026-08-20",
        currency: "INR",
        totalAmount: 92000,
        status: "Converted",
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
    status: QuotationStatus,
) {
    switch (status) {
        case "Accepted":
        case "Converted":
            return "default";

        case "Rejected":
            return "destructive";

        case "Draft":
            return "outline";

        default:
            return "secondary";
    }
}

export default function SalesQuotationsPage() {
    const [search, setSearch] = useState("");

    const filteredQuotations = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return demoQuotations;
        }

        return demoQuotations.filter(
            (quotation) =>
                quotation.quotationNumber
                    .toLowerCase()
                    .includes(query) ||
                quotation.customerName
                    .toLowerCase()
                    .includes(query) ||
                quotation.status
                    .toLowerCase()
                    .includes(query),
        );
    }, [search]);

    const totalQuotations =
        demoQuotations.length;

    const acceptedQuotations =
        demoQuotations.filter(
            (quotation) =>
                quotation.status === "Accepted",
        ).length;

    const convertedQuotations =
        demoQuotations.filter(
            (quotation) =>
                quotation.status === "Converted",
        ).length;

    const pendingQuotations =
        demoQuotations.filter(
            (quotation) =>
                quotation.status === "Sent",
        ).length;

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Quotations
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Create and manage quotations
                        for your customers.
                    </p>
                </div>

                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quotation
                </Button>
            </div>

            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Quotations
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalQuotations}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            All quotations
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
                            {pendingQuotations}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Awaiting customer response
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Accepted
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {acceptedQuotations}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Accepted by customers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Converted
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {convertedQuotations}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Converted to sales orders
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quotation Register */}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Quotation Register
                            </CardTitle>

                            <CardDescription>
                                View quotations and track
                                their status.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search quotations..."
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
                    {filteredQuotations.length ===
                        0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="font-medium">
                                    No quotations found
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try another search term.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredQuotations.map(
                                (quotation) => (
                                    <div
                                        key={
                                            quotation.id
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
                                                            quotation.quotationNumber
                                                        }
                                                    </p>

                                                    <Badge
                                                        variant={getStatusVariant(
                                                            quotation.status,
                                                        )}
                                                    >
                                                        {
                                                            quotation.status
                                                        }
                                                    </Badge>
                                                </div>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {
                                                        quotation.customerName
                                                    }
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        Date:{" "}
                                                        {
                                                            quotation.quotationDate
                                                        }
                                                    </span>

                                                    <span>
                                                        Valid Until:{" "}
                                                        {
                                                            quotation.validUntil
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-6 lg:justify-end">
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {formatAmount(
                                                        quotation.totalAmount,
                                                        quotation.currency,
                                                    )}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        quotation.currency
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
                                                            Quotation actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Quotation
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        Edit Quotation
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download PDF
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Send to Customer
                                                    </DropdownMenuItem>

                                                    {quotation.status ===
                                                        "Accepted" && (
                                                            <>
                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem>
                                                                    Convert to Sales
                                                                    Order
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
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