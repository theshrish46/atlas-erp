"use client";

import { useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    Filter,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    SlidersHorizontal,
    Warehouse,
    X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";

type AdjustmentType = "increase" | "decrease";

type AdjustmentStatus = "approved" | "pending" | "rejected";

type AdjustmentReason =
    | "physical-count"
    | "damaged"
    | "lost"
    | "found"
    | "data-error"
    | "other";

type StockAdjustment = {
    id: string;
    product: string;
    sku: string;
    warehouse: string;
    type: AdjustmentType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: AdjustmentReason;
    reference: string;
    status: AdjustmentStatus;
    createdBy: string;
    createdAt: string;
};

const initialAdjustments: StockAdjustment[] = [
    {
        id: "ADJ-00128",
        product: "Logitech MX Master 3S",
        sku: "LOG-MX3S-BLK",
        warehouse: "Main Warehouse",
        type: "increase",
        quantity: 10,
        previousStock: 124,
        newStock: 134,
        reason: "physical-count",
        reference: "CNT-2026-0823",
        status: "approved",
        createdBy: "Admin",
        createdAt: "Aug 23, 2026 · 10:42 AM",
    },
    {
        id: "ADJ-00127",
        product: "Mechanical Keyboard K2",
        sku: "KEY-K2-RGB",
        warehouse: "Main Warehouse",
        type: "decrease",
        quantity: 4,
        previousStock: 82,
        newStock: 78,
        reason: "damaged",
        reference: "DMG-2026-014",
        status: "approved",
        createdBy: "Rahul Sharma",
        createdAt: "Aug 23, 2026 · 09:18 AM",
    },
    {
        id: "ADJ-00126",
        product: "Dell UltraSharp 27",
        sku: "MON-U2723QE",
        warehouse: "Bengaluru WH",
        type: "decrease",
        quantity: 2,
        previousStock: 31,
        newStock: 29,
        reason: "physical-count",
        reference: "CNT-2026-0822",
        status: "pending",
        createdBy: "Priya N",
        createdAt: "Aug 22, 2026 · 04:35 PM",
    },
    {
        id: "ADJ-00125",
        product: "USB-C Hub 7-in-1",
        sku: "HUB-USBC-7",
        warehouse: "Main Warehouse",
        type: "increase",
        quantity: 6,
        previousStock: 46,
        newStock: 52,
        reason: "found",
        reference: "REC-2026-033",
        status: "approved",
        createdBy: "Admin",
        createdAt: "Aug 22, 2026 · 02:12 PM",
    },
    {
        id: "ADJ-00124",
        product: "Apple Magic Mouse",
        sku: "APP-MOUSE-WHT",
        warehouse: "Mumbai Warehouse",
        type: "decrease",
        quantity: 3,
        previousStock: 27,
        newStock: 24,
        reason: "lost",
        reference: "LOSS-2026-009",
        status: "approved",
        createdBy: "Amit K",
        createdAt: "Aug 21, 2026 · 05:48 PM",
    },
    {
        id: "ADJ-00123",
        product: "HP LaserJet Pro",
        sku: "HP-LJ-M404",
        warehouse: "Main Warehouse",
        type: "increase",
        quantity: 5,
        previousStock: 18,
        newStock: 23,
        reason: "data-error",
        reference: "CORR-2026-021",
        status: "approved",
        createdBy: "Admin",
        createdAt: "Aug 21, 2026 · 11:26 AM",
    },
    {
        id: "ADJ-00122",
        product: "Wireless Barcode Scanner",
        sku: "SCAN-WLS-01",
        warehouse: "Bengaluru WH",
        type: "decrease",
        quantity: 1,
        previousStock: 14,
        newStock: 13,
        reason: "damaged",
        reference: "DMG-2026-013",
        status: "rejected",
        createdBy: "Rahul Sharma",
        createdAt: "Aug 20, 2026 · 03:21 PM",
    },
    {
        id: "ADJ-00121",
        product: "Thermal Label Printer",
        sku: "PRN-TLP-01",
        warehouse: "Main Warehouse",
        type: "increase",
        quantity: 3,
        previousStock: 11,
        newStock: 14,
        reason: "physical-count",
        reference: "CNT-2026-0820",
        status: "approved",
        createdBy: "Priya N",
        createdAt: "Aug 20, 2026 · 10:05 AM",
    },
];

const reasonLabels: Record<AdjustmentReason, string> = {
    "physical-count": "Physical Count",
    damaged: "Damaged",
    lost: "Lost",
    found: "Found",
    "data-error": "Data Error",
    other: "Other",
};

const statusLabels: Record<AdjustmentStatus, string> = {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
};

function formatReason(reason: AdjustmentReason) {
    return reasonLabels[reason];
}

function getStatusBadge(status: AdjustmentStatus) {
    if (status === "approved") {
        return (
            <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
            >
                <Check className="mr-1 h-3 w-3" />
                Approved
            </Badge>
        );
    }

    if (status === "pending") {
        return (
            <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700"
            >
                Pending
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700"
        >
            <X className="mr-1 h-3 w-3" />
            Rejected
        </Badge>
    );
}

export default function StockAdjustmentsPage() {
    const [adjustments, setAdjustments] =
        useState<StockAdjustment[]>(initialAdjustments);

    const [search, setSearch] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [reasonFilter, setReasonFilter] = useState("all");

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [product, setProduct] = useState("");
    const [warehouse, setWarehouse] = useState("");
    const [type, setType] =
        useState<AdjustmentType>("increase");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] =
        useState<AdjustmentReason>("physical-count");
    const [reference, setReference] = useState("");
    const [notes, setNotes] = useState("");

    const filteredAdjustments = useMemo(() => {
        return adjustments.filter((adjustment) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                adjustment.id
                    .toLowerCase()
                    .includes(searchValue) ||
                adjustment.product
                    .toLowerCase()
                    .includes(searchValue) ||
                adjustment.sku
                    .toLowerCase()
                    .includes(searchValue) ||
                adjustment.reference
                    .toLowerCase()
                    .includes(searchValue);

            const matchesWarehouse =
                warehouseFilter === "all" ||
                adjustment.warehouse === warehouseFilter;

            const matchesType =
                typeFilter === "all" ||
                adjustment.type === typeFilter;

            const matchesStatus =
                statusFilter === "all" ||
                adjustment.status === statusFilter;

            const matchesReason =
                reasonFilter === "all" ||
                adjustment.reason === reasonFilter;

            return (
                matchesSearch &&
                matchesWarehouse &&
                matchesType &&
                matchesStatus &&
                matchesReason
            );
        });
    }, [
        adjustments,
        search,
        warehouseFilter,
        typeFilter,
        statusFilter,
        reasonFilter,
    ]);

    const totalAdjustments = adjustments.length;

    const pendingAdjustments = adjustments.filter(
        (adjustment) =>
            adjustment.status === "pending",
    ).length;

    const approvedAdjustments = adjustments.filter(
        (adjustment) =>
            adjustment.status === "approved",
    ).length;

    const currentMonthAdjustments =
        adjustments.filter((adjustment) =>
            adjustment.createdAt.includes("Aug 2026"),
        ).length;

    const clearFilters = () => {
        setSearch("");
        setWarehouseFilter("all");
        setTypeFilter("all");
        setStatusFilter("all");
        setReasonFilter("all");
    };

    const hasActiveFilters =
        search !== "" ||
        warehouseFilter !== "all" ||
        typeFilter !== "all" ||
        statusFilter !== "all" ||
        reasonFilter !== "all";

    const numericQuantity =
        Number(quantity) || 0;

    const mockCurrentStock = product
        ? 124
        : 0;

    const calculatedStock =
        type === "increase"
            ? mockCurrentStock + numericQuantity
            : Math.max(
                0,
                mockCurrentStock - numericQuantity,
            );

    const createAdjustment = () => {
        if (
            !product ||
            !warehouse ||
            !quantity ||
            numericQuantity <= 0
        ) {
            return;
        }

        const newAdjustment: StockAdjustment = {
            id: `ADJ-${String(
                129 + adjustments.length - initialAdjustments.length,
            ).padStart(5, "0")}`,
            product,
            sku: "SKU-PENDING",
            warehouse,
            type,
            quantity: numericQuantity,
            previousStock: mockCurrentStock,
            newStock: calculatedStock,
            reason,
            reference:
                reference || "MANUAL-ADJUSTMENT",
            status: "pending",
            createdBy: "Admin",
            createdAt:
                "Aug 23, 2026 · Just now",
        };

        setAdjustments((current) => [
            newAdjustment,
            ...current,
        ]);

        setProduct("");
        setWarehouse("");
        setType("increase");
        setQuantity("");
        setReason("physical-count");
        setReference("");
        setNotes("");
        setIsCreateOpen(false);
    };

    return (
        <div className="flex h-full min-h-0 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardList className="h-4 w-4" />
                        Inventory
                        <span>/</span>
                        Adjustments
                    </div>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                        Stock Adjustments
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Correct inventory discrepancies and
                        maintain accurate stock records.
                    </p>
                </div>

                <Dialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                >
                    <DialogTrigger asChild>
                        <Button className="h-10 gap-2">
                            <Plus className="h-4 w-4" />
                            New Adjustment
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                Create Stock Adjustment
                            </DialogTitle>

                            <DialogDescription>
                                Correct the recorded inventory
                                quantity for a product in a
                                warehouse.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Warehouse + Product */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>
                                        Warehouse
                                    </Label>

                                    <Select
                                        value={warehouse}
                                        onValueChange={
                                            setWarehouse
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select warehouse" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="Main Warehouse">
                                                Main Warehouse
                                            </SelectItem>

                                            <SelectItem value="Bengaluru WH">
                                                Bengaluru WH
                                            </SelectItem>

                                            <SelectItem value="Mumbai Warehouse">
                                                Mumbai Warehouse
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Product
                                    </Label>

                                    <Select
                                        value={product}
                                        onValueChange={
                                            setProduct
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="Logitech MX Master 3S">
                                                Logitech MX Master
                                                3S
                                            </SelectItem>

                                            <SelectItem value="Mechanical Keyboard K2">
                                                Mechanical Keyboard
                                                K2
                                            </SelectItem>

                                            <SelectItem value="Dell UltraSharp 27">
                                                Dell UltraSharp 27
                                            </SelectItem>

                                            <SelectItem value="USB-C Hub 7-in-1">
                                                USB-C Hub 7-in-1
                                            </SelectItem>

                                            <SelectItem value="Apple Magic Mouse">
                                                Apple Magic Mouse
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Current stock */}
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Current Stock
                                        </p>

                                        <p className="mt-1 text-2xl font-bold">
                                            {product
                                                ? `${mockCurrentStock} units`
                                                : "—"}
                                        </p>
                                    </div>

                                    <Package className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                            </div>

                            {/* Adjustment type */}
                            <div className="space-y-2">
                                <Label>
                                    Adjustment Type
                                </Label>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        variant={
                                            type ===
                                                "increase"
                                                ? "default"
                                                : "outline"
                                        }
                                        className="h-11"
                                        onClick={() =>
                                            setType(
                                                "increase",
                                            )
                                        }
                                    >
                                        <ArrowUp className="mr-2 h-4 w-4" />
                                        Increase Stock
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={
                                            type ===
                                                "decrease"
                                                ? "default"
                                                : "outline"
                                        }
                                        className="h-11"
                                        onClick={() =>
                                            setType(
                                                "decrease",
                                            )
                                        }
                                    >
                                        <ArrowDown className="mr-2 h-4 w-4" />
                                        Decrease Stock
                                    </Button>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">
                                        Adjustment Quantity
                                    </Label>

                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        placeholder="Enter quantity"
                                        value={quantity}
                                        onChange={(event) =>
                                            setQuantity(
                                                event.target
                                                    .value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        New Stock
                                    </Label>

                                    <div className="flex h-10 items-center rounded-md border bg-muted/30 px-3 text-sm font-semibold">
                                        {product &&
                                            quantity
                                            ? `${calculatedStock} units`
                                            : "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>
                                        Reason
                                    </Label>

                                    <Select
                                        value={reason}
                                        onValueChange={(
                                            value,
                                        ) =>
                                            setReason(
                                                value as AdjustmentReason,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="physical-count">
                                                Physical Count
                                            </SelectItem>

                                            <SelectItem value="damaged">
                                                Damaged
                                            </SelectItem>

                                            <SelectItem value="lost">
                                                Lost
                                            </SelectItem>

                                            <SelectItem value="found">
                                                Found
                                            </SelectItem>

                                            <SelectItem value="data-error">
                                                Data Error
                                            </SelectItem>

                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference">
                                        Reference
                                    </Label>

                                    <Input
                                        id="reference"
                                        placeholder="CNT-2026-001"
                                        value={reference}
                                        onChange={(event) =>
                                            setReference(
                                                event.target
                                                    .value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Notes
                                </Label>

                                <Textarea
                                    id="notes"
                                    placeholder="Add additional information about this adjustment..."
                                    className="min-h-24 resize-none"
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(
                                            event.target
                                                .value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setIsCreateOpen(false)
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                disabled={
                                    !product ||
                                    !warehouse ||
                                    !quantity ||
                                    numericQuantity <= 0
                                }
                                onClick={
                                    createAdjustment
                                }
                            >
                                Create Adjustment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Adjustments
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {totalAdjustments}
                                </p>
                            </div>

                            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Pending
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {pendingAdjustments}
                                </p>
                            </div>

                            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                                <SlidersHorizontal className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Approved
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {approvedAdjustments}
                                </p>
                            </div>

                            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                                <Check className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    This Month
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {currentMonthAdjustments}
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                                <Package className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="min-h-0 flex-1 overflow-hidden">
                <CardHeader className="space-y-4 border-b pb-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                Adjustment History
                            </CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Review and track inventory
                                quantity corrections.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    placeholder="Search adjustments..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target
                                                .value,
                                        )
                                    }
                                />
                            </div>

                            <Select
                                value={warehouseFilter}
                                onValueChange={
                                    setWarehouseFilter
                                }
                            >
                                <SelectTrigger className="w-[170px]">
                                    <Warehouse className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Warehouse" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All Warehouses
                                    </SelectItem>

                                    <SelectItem value="Main Warehouse">
                                        Main Warehouse
                                    </SelectItem>

                                    <SelectItem value="Bengaluru WH">
                                        Bengaluru WH
                                    </SelectItem>

                                    <SelectItem value="Mumbai Warehouse">
                                        Mumbai Warehouse
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={typeFilter}
                                onValueChange={
                                    setTypeFilter
                                }
                            >
                                <SelectTrigger className="w-[145px]">
                                    <ArrowUpDown className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All Types
                                    </SelectItem>

                                    <SelectItem value="increase">
                                        Increase
                                    </SelectItem>

                                    <SelectItem value="decrease">
                                        Decrease
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={statusFilter}
                                onValueChange={
                                    setStatusFilter
                                }
                            >
                                <SelectTrigger className="w-[135px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>

                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>

                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>

                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Filter className="h-3.5 w-3.5" />
                            Showing {filteredAdjustments.length}{" "}
                            of {adjustments.length} adjustments
                        </div>
                    )}
                </CardHeader>

                <CardContent className="h-full overflow-auto p-0">
                    <div className="min-w-[1100px]">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-background">
                                <TableRow>
                                    <TableHead className="pl-6">
                                        Adjustment
                                    </TableHead>

                                    <TableHead>
                                        Product
                                    </TableHead>

                                    <TableHead>
                                        Warehouse
                                    </TableHead>

                                    <TableHead>
                                        Change
                                    </TableHead>

                                    <TableHead>
                                        Stock
                                    </TableHead>

                                    <TableHead>
                                        Reason
                                    </TableHead>

                                    <TableHead>
                                        Status
                                    </TableHead>

                                    <TableHead>
                                        Created
                                    </TableHead>

                                    <TableHead className="w-12 pr-6" />
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredAdjustments.map(
                                    (adjustment) => (
                                        <TableRow
                                            key={
                                                adjustment.id
                                            }
                                            className="group"
                                        >
                                            <TableCell className="pl-6">
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            adjustment.id
                                                        }
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            adjustment.reference
                                                        }
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            adjustment.product
                                                        }
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            adjustment.sku
                                                        }
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Warehouse className="h-4 w-4 text-muted-foreground" />

                                                    <span>
                                                        {
                                                            adjustment.warehouse
                                                        }
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div
                                                    className={`flex items-center gap-1 font-semibold ${adjustment.type ===
                                                            "increase"
                                                            ? "text-emerald-600"
                                                            : "text-red-600"
                                                        }`}
                                                >
                                                    {adjustment.type ===
                                                        "increase" ? (
                                                        <ArrowUp className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ArrowDown className="h-3.5 w-3.5" />
                                                    )}

                                                    {adjustment.type ===
                                                        "increase"
                                                        ? "+"
                                                        : "-"}
                                                    {
                                                        adjustment.quantity
                                                    }
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">
                                                        {
                                                            adjustment.previousStock
                                                        }
                                                    </span>

                                                    <span className="mx-1 text-muted-foreground">
                                                        →
                                                    </span>

                                                    <span className="font-semibold">
                                                        {
                                                            adjustment.newStock
                                                        }
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm">
                                                    {formatReason(
                                                        adjustment.reason,
                                                    )}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                {getStatusBadge(
                                                    adjustment.status,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <p className="text-sm">
                                                        {
                                                            adjustment.createdAt
                                                        }
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            adjustment.createdBy
                                                        }
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell className="pr-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}

                                {filteredAdjustments.length ===
                                    0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="h-64"
                                            >
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    <div className="rounded-full bg-muted p-4">
                                                        <ClipboardList className="h-6 w-6 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="mt-4 font-semibold">
                                                        No adjustments
                                                        found
                                                    </h3>

                                                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                                        Try changing
                                                        your filters
                                                        or create a
                                                        new stock
                                                        adjustment.
                                                    </p>

                                                    {hasActiveFilters && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-4"
                                                            onClick={
                                                                clearFilters
                                                            }
                                                        >
                                                            Clear
                                                            Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                        {filteredAdjustments.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                        {adjustments.length}
                    </span>{" "}
                    adjustments
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                    >
                        1
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}