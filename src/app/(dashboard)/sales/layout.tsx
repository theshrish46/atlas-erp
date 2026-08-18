import Link from "next/link";
import {
    ArrowLeft,
    FileText,
    Handshake,
    Receipt,
    ShoppingCart,
    Users,
} from "lucide-react";

export default function SalesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="space-y-6">
            {/* Sales Header */}

            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Sales
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage customers, sales orders,
                        invoices, and payments.
                    </p>
                </div>
            </div>

            {/* Sales Navigation */}

            <div className="flex flex-wrap gap-2 border-b pb-4">
                <Link
                    href="/sales"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    Overview
                </Link>

                <Link
                    href="/sales/customers"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Users className="h-4 w-4" />
                    Customers
                </Link>

                <Link
                    href="/sales/quotations"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Handshake className="h-4 w-4" />
                    Quotations
                </Link>
                <Link
                    href="/sales/orders"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <ShoppingCart className="h-4 w-4" />
                    Sales Orders
                </Link>

                <Link
                    href="/sales/invoices"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Receipt className="h-4 w-4" />
                    Invoices
                </Link>

                <Link
                    href="/sales/payments"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <FileText className="h-4 w-4" />
                    Payments
                </Link>

            </div>

            {/* Current Sales Page */}

            <div>
                {children}
            </div>
        </div>
    );
}