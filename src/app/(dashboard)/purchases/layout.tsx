import Link from "next/link";
import {
    ArrowLeft,
    FileText,
    PackageCheck,
    Receipt,
    ShoppingCart,
    Store,
} from "lucide-react";

export default function PurchasesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="space-y-6">
            {/* Purchases Header */}

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
                        Purchases
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage vendors, purchase orders,
                        goods received, and purchase invoices.
                    </p>
                </div>
            </div>

            {/* Purchases Navigation */}

            <div className="flex flex-wrap gap-2 border-b pb-4">
                <Link
                    href="/purchases"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <ShoppingCart className="h-4 w-4" />
                    Overview
                </Link>

                <Link
                    href="/purchases/vendors"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Store className="h-4 w-4" />
                    Vendors
                </Link>

                <Link
                    href="/purchases/purchase-orders"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <FileText className="h-4 w-4" />
                    Purchase Orders
                </Link>

                <Link
                    href="/purchases/goods-received-notes"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <PackageCheck className="h-4 w-4" />
                    Goods Received
                </Link>

                <Link
                    href="/purchases/invoices"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Receipt className="h-4 w-4" />
                    Invoices
                </Link>
                <Link
                    href="/purchases/payments"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Receipt className="h-4 w-4" />
                    Payments
                </Link>
            </div>

            {/* Current Purchases Page */}

            <div>
                {children}
            </div>
        </div>
    );
}