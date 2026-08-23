"use client";

import { useMemo, useState } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Filter,
    Package,
    RefreshCw,
    Search,
    SlidersHorizontal,
    TrendingDown,
    TrendingUp,
    Warehouse,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

/* =============================================================================
 * TYPES
 * ============================================================================= */

type MovementType =
    | "receipt"
    | "issue"
    | "transfer"
    | "adjustment"
    | "return";

type MovementStatus = "completed" | "pending" | "cancelled";

type StockMovement = {
    id: string;
    date: string;
    time: string;
    product: string;
    sku: string;
    movementType: MovementType;
    quantity: number;
    unit: string;
    source: string;
    destination: string;
    reference: string;
    status: MovementStatus;
    performedBy: string;
};

/* =============================================================================
 * SAMPLE DATA
 * ============================================================================= */

const MOVEMENTS: StockMovement[] = [
    {
        id: "SM-000124",
        date: "18 Aug 2026",
        time: "10:42 AM",
        product: "Samsung Galaxy S25",
        sku: "SAM-S25-256-BLK",
        movementType: "receipt",
        quantity: 25,
        unit: "pcs",
        source: "Supplier",
        destination: "Main Warehouse",
        reference: "GRN-000241",
        status: "completed",
        performedBy: "Rahul Sharma",
    },
    {
        id: "SM-000123",
        date: "18 Aug 2026",
        time: "09:18 AM",
        product: "Logitech MX Master 3S",
        sku: "LOG-MX3S-BLK",
        movementType: "transfer",
        quantity: 12,
        unit: "pcs",
        source: "Main Warehouse",
        destination: "Retail Store",
        reference: "TRF-000089",
        status: "completed",
        performedBy: "Amit Kumar",
    },
    {
        id: "SM-000122",
        date: "17 Aug 2026",
        time: "04:35 PM",
        product: "Dell Latitude 5450",
        sku: "DEL-LAT5450-I5",
        movementType: "issue",
        quantity: 4,
        unit: "pcs",
        source: "Main Warehouse",
        destination: "IT Department",
        reference: "ISS-000156",
        status: "completed",
        performedBy: "Priya Nair",
    },
    {
        id: "SM-000121",
        date: "17 Aug 2026",
        time: "02:11 PM",
        product: "HP LaserJet Pro M404",
        sku: "HP-M404DN",
        movementType: "adjustment",
        quantity: 2,
        unit: "pcs",
        source: "Main Warehouse",
        destination: "Main Warehouse",
        reference: "ADJ-000034",
        status: "completed",
        performedBy: "Rahul Sharma",
    },
    {
        id: "SM-000120",
        date: "16 Aug 2026",
        time: "11:27 AM",
        product: "Canon 054 Toner",
        sku: "CAN-054-BLK",
        movementType: "return",
        quantity: 6,
        unit: "pcs",
        source: "Retail Store",
        destination: "Main Warehouse",
        reference: "RET-000021",
        status: "completed",
        performedBy: "Sneha Patil",
    },
    {
        id: "SM-000119",
        date: "16 Aug 2026",
        time: "10:05 AM",
        product: "Apple MacBook Air M4",
        sku: "APL-MBA-M4-256",
        movementType: "transfer",
        quantity: 8,
        unit: "pcs",
        source: "Main Warehouse",
        destination: "Bengaluru Warehouse",
        reference: "TRF-000088",
        status: "pending",
        performedBy: "Amit Kumar",
    },
    {
        id: "SM-000118",
        date: "15 Aug 2026",
        time: "03:42 PM",
        product: "TP-Link WiFi Router",
        sku: "TPL-AX1500",
        movementType: "issue",
        quantity: 15,
        unit: "pcs",
        source: "Main Warehouse",
        destination: "Sales Department",
        reference: "ISS-000155",
        status: "completed",
        performedBy: "Priya Nair",
    },
    {
        id: "SM-000117",
        date: "15 Aug 2026",
        time: "01:16 PM",
        product: "Kingston 1TB SSD",
        sku: "KIN-SSD-1TB",
        movementType: "receipt",
        quantity: 40,
        unit: "pcs",
        source: "Supplier",
        destination: "Main Warehouse",
        reference: "GRN-000240",
        status: "completed",
        performedBy: "Rahul Sharma",
    },
    {
        id: "SM-000116",
        date: "14 Aug 2026",
        time: "05:03 PM",
        product: "Epson EcoTank L3250",
        sku: "EPS-L3250",
        movementType: "return",
        quantity: 3,
        unit: "pcs",
        source: "Customer",
        destination: "Main Warehouse",
        reference: "RET-000020",
        status: "completed",
        performedBy: "Sneha Patil",
    },
    {
        id: "SM-000115",
        date: "14 Aug 2026",
        time: "11:48 AM",
        product: "Sony WH-1000XM5",
        sku: "SON-WH1000XM5",
        movementType: "issue",
        quantity: 7,
        unit: "pcs",
        source: "Main Warehouse",
        destination: "Online Orders",
        reference: "ISS-000154",
        status: "completed",
        performedBy: "Amit Kumar",
    },
];

/* =============================================================================
 * HELPERS
 * ============================================================================= */

function getMovementLabel(type: MovementType) {
    switch (type) {
        case "receipt":
            return "Receipt";
        case "issue":
            return "Issue";
        case "transfer":
            return "Transfer";
        case "adjustment":
            return "Adjustment";
        case "return":
            return "Return";
    }
}

function getMovementIcon(type: MovementType) {
    switch (type) {
        case "receipt":
            return ArrowDownToLine;
        case "issue":
            return ArrowUpFromLine;
        case "transfer":
            return ArrowLeftRight;
        case "adjustment":
            return SlidersHorizontal;
        case "return":
            return RefreshCw;
    }
}

function getMovementBadge(type: MovementType) {
    switch (type) {
        case "receipt":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "issue":
            return "border-red-200 bg-red-50 text-red-700";
        case "transfer":
            return "border-blue-200 bg-blue-50 text-blue-700";
        case "adjustment":
            return "border-amber-200 bg-amber-50 text-amber-700";
        case "return":
            return "border-purple-200 bg-purple-50 text-purple-700";
    }
}

function getStatusBadge(status: MovementStatus) {
    switch (status) {
        case "completed":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "pending":
            return "border-amber-200 bg-amber-50 text-amber-700";
        case "cancelled":
            return "border-red-200 bg-red-50 text-red-700";
    }
}

/* =============================================================================
 * PAGE
 * ============================================================================= */

export default function StockMovementsPage() {
    const [search, setSearch] = useState("");
    const [movementType, setMovementType] = useState("all");
    const [status, setStatus] = useState("all");
    const [warehouse, setWarehouse] = useState("all");
    const [page, setPage] = useState(1);

    const filteredMovements = useMemo(() => {
        const query = search.toLowerCase().trim();

        return MOVEMENTS.filter((movement) => {
            const matchesSearch =
                !query ||
                movement.id.toLowerCase().includes(query) ||
                movement.product.toLowerCase().includes(query) ||
                movement.sku.toLowerCase().includes(query) ||
                movement.reference.toLowerCase().includes(query) ||
                movement.performedBy.toLowerCase().includes(query);

            const matchesType =
                movementType === "all" ||
                movement.movementType === movementType;

            const matchesStatus =
                status === "all" ||
                movement.status === status;

            const matchesWarehouse =
                warehouse === "all" ||
                movement.source === warehouse ||
                movement.destination === warehouse;

            return (
                matchesSearch &&
                matchesType &&
                matchesStatus &&
                matchesWarehouse
            );
        });
    }, [search, movementType, status, warehouse]);

    const totalMovements = filteredMovements.length;

    const totalReceived = filteredMovements
        .filter((item) => item.movementType === "receipt")
        .reduce((sum, item) => sum + item.quantity, 0);

    const totalIssued = filteredMovements
        .filter((item) => item.movementType === "issue")
        .reduce((sum, item) => sum + item.quantity, 0);

    const totalTransfers = filteredMovements
        .filter((item) => item.movementType === "transfer")
        .reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex min-h-full flex-col gap-6 p-6">
            {/* =================================================================
             * HEADER
             * ================================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        Inventory
                        <span>/</span>
                        Stock Movements
                    </div>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight">
                        Stock Movements
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Track every movement of inventory across your
                        warehouses and locations.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>

                    <Button variant="outline">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Date Range
                    </Button>
                </div>
            </div>

            {/* =================================================================
             * SUMMARY CARDS
             * ================================================================= */}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Movements
                                </p>

                                <p className="mt-2 text-2xl font-bold">
                                    {totalMovements}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Recorded transactions
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                                <ArrowLeftRight className="h-5 w-5 text-slate-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Stock Received
                                </p>

                                <p className="mt-2 text-2xl font-bold text-emerald-600">
                                    +{totalReceived}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Units received
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Stock Issued
                                </p>

                                <p className="mt-2 text-2xl font-bold text-red-600">
                                    -{totalIssued}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Units issued
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Transfers
                                </p>

                                <p className="mt-2 text-2xl font-bold text-blue-600">
                                    {totalTransfers}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Units transferred
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                <Warehouse className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* =================================================================
             * FILTERS
             * ================================================================= */}

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search product, SKU, movement ID or reference..."
                                className="pl-9"
                            />
                        </div>

                        <Select
                            value={movementType}
                            onValueChange={(value) => {
                                setMovementType(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full xl:w-[170px]">
                                <SelectValue placeholder="Movement Type" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    All Types
                                </SelectItem>
                                <SelectItem value="receipt">
                                    Receipt
                                </SelectItem>
                                <SelectItem value="issue">
                                    Issue
                                </SelectItem>
                                <SelectItem value="transfer">
                                    Transfer
                                </SelectItem>
                                <SelectItem value="adjustment">
                                    Adjustment
                                </SelectItem>
                                <SelectItem value="return">
                                    Return
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={warehouse}
                            onValueChange={(value) => {
                                setWarehouse(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full xl:w-[190px]">
                                <SelectValue placeholder="Warehouse" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    All Locations
                                </SelectItem>
                                <SelectItem value="Main Warehouse">
                                    Main Warehouse
                                </SelectItem>
                                <SelectItem value="Bengaluru Warehouse">
                                    Bengaluru Warehouse
                                </SelectItem>
                                <SelectItem value="Retail Store">
                                    Retail Store
                                </SelectItem>
                                <SelectItem value="IT Department">
                                    IT Department
                                </SelectItem>
                                <SelectItem value="Sales Department">
                                    Sales Department
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={status}
                            onValueChange={(value) => {
                                setStatus(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full xl:w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    All Status
                                </SelectItem>
                                <SelectItem value="completed">
                                    Completed
                                </SelectItem>
                                <SelectItem value="pending">
                                    Pending
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    Cancelled
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            More Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* =================================================================
             * MOVEMENT TABLE
             * ================================================================= */}

            <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="font-semibold">
                            Movement History
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Complete inventory transaction history
                        </p>
                    </div>

                    <Badge variant="secondary">
                        {filteredMovements.length} records
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">
                                    Movement ID
                                </TableHead>

                                <TableHead>
                                    Date
                                </TableHead>

                                <TableHead>
                                    Product
                                </TableHead>

                                <TableHead>
                                    Type
                                </TableHead>

                                <TableHead>
                                    Quantity
                                </TableHead>

                                <TableHead>
                                    Source
                                </TableHead>

                                <TableHead>
                                    Destination
                                </TableHead>

                                <TableHead>
                                    Reference
                                </TableHead>

                                <TableHead>
                                    Status
                                </TableHead>

                                <TableHead className="text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredMovements.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="h-40 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="mb-3 h-8 w-8 text-muted-foreground/50" />

                                            <p className="font-medium">
                                                No stock movements found
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Try changing your search or
                                                filters.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMovements.map((movement) => {
                                    const Icon = getMovementIcon(
                                        movement.movementType,
                                    );

                                    return (
                                        <TableRow
                                            key={movement.id}
                                            className="group"
                                        >
                                            <TableCell>
                                                <span className="font-mono text-xs font-semibold">
                                                    {movement.id}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {movement.date}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {movement.time}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="min-w-[190px]">
                                                    <p className="font-medium">
                                                        {movement.product}
                                                    </p>

                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {movement.sku}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`gap-1.5 ${getMovementBadge(
                                                        movement.movementType,
                                                    )}`}
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {getMovementLabel(
                                                        movement.movementType,
                                                    )}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`font-semibold ${movement.movementType ===
                                                        "receipt" ||
                                                        movement.movementType ===
                                                        "return"
                                                        ? "text-emerald-600"
                                                        : movement.movementType ===
                                                            "issue"
                                                            ? "text-red-600"
                                                            : ""
                                                        }`}
                                                >
                                                    {movement.movementType ===
                                                        "receipt" ||
                                                        movement.movementType ===
                                                        "return"
                                                        ? "+"
                                                        : movement.movementType ===
                                                            "issue"
                                                            ? "-"
                                                            : ""}
                                                    {movement.quantity}
                                                </span>{" "}
                                                <span className="text-xs text-muted-foreground">
                                                    {movement.unit}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm">
                                                    {movement.source}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm">
                                                    {movement.destination}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span className="font-mono text-xs font-medium">
                                                    {movement.reference}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={getStatusBadge(
                                                        movement.status,
                                                    )}
                                                >
                                                    {movement.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        movement.status.slice(
                                                            1,
                                                        )}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                    title="View movement"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* =============================================================
                 * PAGINATION
                 * ============================================================= */}

                <div className="flex items-center justify-between border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {filteredMovements.length}
                        </span>{" "}
                        movements
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() =>
                                setPage((current) =>
                                    Math.max(1, current - 1),
                                )
                            }
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                        >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}