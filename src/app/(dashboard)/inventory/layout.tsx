import Link from "next/link";
import {
    ArrowLeft,
    Boxes,
    Warehouse,
    ArrowDownUp,
    ClipboardList,
    PackageCheck,
} from "lucide-react";

export default function InventoryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="space-y-6">
            {/* Inventory Header */}

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
                        Inventory
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage products, stock, warehouses, and inventory movements.
                    </p>
                </div>
            </div>

            {/* Inventory Navigation */}

            <div className="flex flex-wrap gap-2 border-b pb-4">
                <Link
                    href="/inventory"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Boxes className="h-4 w-4" />
                    Overview
                </Link>

                <Link
                    href="/inventory/products"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <PackageCheck className="h-4 w-4" />
                    Products
                </Link>

                <Link
                    href="/inventory/warehouses"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <Warehouse className="h-4 w-4" />
                    Warehouses
                </Link>

                <Link
                    href="/inventory/stock-movements"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <ArrowDownUp className="h-4 w-4" />
                    Stock Movements
                </Link>

                <Link
                    href="/inventory/adjustments"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                    <ClipboardList className="h-4 w-4" />
                    Adjustments
                </Link>
            </div>

            {/* Current Inventory Page */}

            <div>
                {children}
            </div>
        </div>
    );
}