// app/purchases/purchase-orders/page.tsx

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
    ShoppingCart,
    Truck,
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
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PurchaseOrderStatus =
    | "draft"
    | "sent"
    | "confirmed"
    | "partially_received"
    | "received"
    | "cancelled";

type PurchaseOrderItem = {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    taxPercent: number;
    lineTotal: number;
};

type PurchaseOrder = {
    id: string;
    purchaseOrderNumber: string;
    vendorId: string;
    vendorName: string;
    orderDate: string;
    expectedDeliveryDate: string | null;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    totalAmount: number;
    status: PurchaseOrderStatus;
    warehouseId: string;
    notes: string | null;
    items: PurchaseOrderItem[];
};

type Vendor = {
    id: string;
    name: string;
};

type Warehouse = {
    id: string;
    name: string;
};

type Product = {
    id: string;
    name: string;
};

const emptyItem: PurchaseOrderItem = {
    productId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxPercent: 0,
    lineTotal: 0,
};

function getStatusLabel(status: PurchaseOrderStatus) {
    switch (status) {
        case "draft":
            return "Draft";
        case "sent":
            return "Sent";
        case "confirmed":
            return "Confirmed";
        case "partially_received":
            return "Partially Received";
        case "received":
            return "Received";
        case "cancelled":
            return "Cancelled";
        default:
            return status;
    }
}

function getStatusVariant(status: PurchaseOrderStatus) {
    switch (status) {
        case "confirmed":
            return "default" as const;
        case "received":
            return "secondary" as const;
        case "cancelled":
            return "destructive" as const;
        default:
            return "outline" as const;
    }
}

export default function PurchaseOrdersPage() {
    const [search, setSearch] = useState("");

    const [purchaseOrders, setPurchaseOrders] = useState<
        PurchaseOrder[]
    >([]);

    const [vendors] = useState<Vendor[]>([]);
    const [warehouses] = useState<Warehouse[]>([]);
    const [products] = useState<Product[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOrder, setEditingOrder] =
        useState<PurchaseOrder | null>(null);

    const [vendorId, setVendorId] = useState("");
    const [warehouseId, setWarehouseId] = useState("");
    const [orderDate, setOrderDate] = useState("");
    const [expectedDeliveryDate, setExpectedDeliveryDate] =
        useState("");
    const [shippingAmount, setShippingAmount] = useState("0");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<PurchaseOrderItem[]>([
        emptyItem,
    ]);

    const draftOrders = useMemo(
        () =>
            purchaseOrders.filter(
                (order) => order.status === "draft",
            ).length,
        [purchaseOrders],
    );

    const pendingOrders = useMemo(
        () =>
            purchaseOrders.filter(
                (order) =>
                    order.status === "sent" ||
                    order.status === "confirmed",
            ).length,
        [purchaseOrders],
    );

    const partiallyReceivedOrders = useMemo(
        () =>
            purchaseOrders.filter(
                (order) =>
                    order.status === "partially_received",
            ).length,
        [purchaseOrders],
    );

    const totalPurchaseValue = useMemo(
        () =>
            purchaseOrders.reduce(
                (total, order) =>
                    total + Number(order.totalAmount),
                0,
            ),
        [purchaseOrders],
    );

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return purchaseOrders;
        }

        return purchaseOrders.filter(
            (order) =>
                order.purchaseOrderNumber
                    .toLowerCase()
                    .includes(query) ||
                order.vendorName
                    .toLowerCase()
                    .includes(query) ||
                getStatusLabel(order.status)
                    .toLowerCase()
                    .includes(query),
        );
    }, [purchaseOrders, search]);

    const subtotal = useMemo(
        () =>
            items.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity) *
                    Number(item.unitPrice),
                0,
            ),
        [items],
    );

    const discountAmount = useMemo(
        () =>
            items.reduce(
                (total, item) => {
                    const base =
                        Number(item.quantity) *
                        Number(item.unitPrice);

                    return (
                        total +
                        (base *
                            Number(item.discountPercent)) /
                        100
                    );
                },
                0,
            ),
        [items],
    );

    const taxAmount = useMemo(
        () =>
            items.reduce(
                (total, item) => {
                    const base =
                        Number(item.quantity) *
                        Number(item.unitPrice);

                    const discountedBase =
                        base -
                        (base *
                            Number(item.discountPercent)) /
                        100;

                    return (
                        total +
                        (discountedBase *
                            Number(item.taxPercent)) /
                        100
                    );
                },
                0,
            ),
        [items],
    );

    const totalAmount =
        subtotal -
        discountAmount +
        taxAmount +
        Number(shippingAmount || 0);

    function resetForm() {
        setVendorId("");
        setWarehouseId("");
        setOrderDate(
            new Date().toISOString().split("T")[0],
        );
        setExpectedDeliveryDate("");
        setShippingAmount("0");
        setNotes("");
        setItems([{ ...emptyItem }]);
        setEditingOrder(null);
    }

    function openCreateDialog() {
        resetForm();
        setDialogOpen(true);
    }

    function openEditDialog(order: PurchaseOrder) {
        setEditingOrder(order);
        setVendorId(order.vendorId);
        setWarehouseId(order.warehouseId);
        setOrderDate(
            new Date(order.orderDate)
                .toISOString()
                .split("T")[0],
        );
        setExpectedDeliveryDate(
            order.expectedDeliveryDate
                ? new Date(order.expectedDeliveryDate)
                    .toISOString()
                    .split("T")[0]
                : "",
        );
        setShippingAmount(
            String(order.shippingAmount ?? 0),
        );
        setNotes(order.notes ?? "");
        setItems(
            order.items.length
                ? order.items
                : [{ ...emptyItem }],
        );
        setDialogOpen(true);
    }

    function updateItem(
        index: number,
        field: keyof PurchaseOrderItem,
        value: string | number,
    ) {
        setItems((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item,
            ),
        );
    }

    function addItem() {
        setItems((current) => [
            ...current,
            { ...emptyItem },
        ]);
    }

    function removeItem(index: number) {
        setItems((current) => {
            if (current.length === 1) {
                return current;
            }

            return current.filter(
                (_, itemIndex) => itemIndex !== index,
            );
        });
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const payload = {
            vendorId,
            warehouseId,
            orderDate,
            expectedDeliveryDate:
                expectedDeliveryDate || null,
            shippingAmount: Number(
                shippingAmount || 0,
            ),
            notes: notes.trim() || null,
            items: items.map((item) => ({
                productId: item.productId,
                description:
                    item.description.trim() || null,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                discountPercent: Number(
                    item.discountPercent,
                ),
                taxPercent: Number(item.taxPercent),
            })),
        };

        try {
            const url = editingOrder
                ? `/api/purchases/purchase-orders/${editingOrder.id}`
                : "/api/purchases/purchase-orders";

            const response = await fetch(url, {
                method: editingOrder ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Failed to save purchase order",
                );
            }

            const savedOrder = data?.data?.purchaseOrder;

            if (savedOrder) {
                if (editingOrder) {
                    setPurchaseOrders((current) =>
                        current.map((order) =>
                            order.id === savedOrder.id
                                ? {
                                    ...savedOrder,
                                    vendorName:
                                        savedOrder.vendorName ||
                                        vendors.find(
                                            (vendor) =>
                                                vendor.id ===
                                                savedOrder.vendorId,
                                        )?.name ||
                                        editingOrder.vendorName,
                                }
                                : order,
                        ),
                    );
                } else {
                    setPurchaseOrders((current) => [
                        {
                            ...savedOrder,
                            vendorName:
                                savedOrder.vendorName ||
                                vendors.find(
                                    (vendor) =>
                                        vendor.id ===
                                        savedOrder.vendorId,
                                )?.name ||
                                "Unknown Vendor",
                        },
                        ...current,
                    ]);
                }
            }

            setDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error(
                "Purchase order save error:",
                error,
            );
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/purchases"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
                            title="Back to Purchases"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <h2 className="text-xl font-semibold tracking-tight">
                            Purchase Orders
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create, track, and manage orders placed
                        with your vendors.
                    </p>
                </div>

                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Purchase Order
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Orders
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {purchaseOrders.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Purchase orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Draft Orders
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {draftOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Not yet submitted
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Awaiting Fulfillment
                        </CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sent or confirmed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Purchase Value
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalPurchaseValue.toLocaleString(
                                "en-IN",
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total order value
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>
                                Purchase Order Directory
                            </CardTitle>

                            <CardDescription>
                                View and manage all purchase
                                orders.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                className="pl-9"
                                placeholder="Search purchase orders..."
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

                <Separator />

                <CardContent className="p-0">
                    {filteredOrders.length === 0 ? (
                        <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <FileText className="h-6 w-6" />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                {search
                                    ? "No purchase orders found"
                                    : "No purchase orders yet"}
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                {search
                                    ? "Try searching with another order number, vendor, or status."
                                    : "Create your first purchase order to begin your purchasing workflow."}
                            </p>

                            {!search && (
                                <Button
                                    className="mt-5"
                                    onClick={
                                        openCreateDialog
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Purchase Order
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">
                                                    {
                                                        order.purchaseOrderNumber
                                                    }
                                                </p>

                                                <Badge
                                                    variant={getStatusVariant(
                                                        order.status,
                                                    )}
                                                >
                                                    {getStatusLabel(
                                                        order.status,
                                                    )}
                                                </Badge>
                                            </div>

                                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                                {
                                                    order.vendorName
                                                }
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span>
                                                    Ordered{" "}
                                                    {new Date(
                                                        order.orderDate,
                                                    ).toLocaleDateString()}
                                                </span>

                                                {order.expectedDeliveryDate && (
                                                    <span>
                                                        Expected{" "}
                                                        {new Date(
                                                            order.expectedDeliveryDate,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                ₹{" "}
                                                {Number(
                                                    order.totalAmount,
                                                ).toLocaleString(
                                                    "en-IN",
                                                )}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Order value
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
                                                        Purchase order actions
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/purchases/purchase-orders/${order.id}`}
                                                    >
                                                        View Purchase
                                                        Order
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEditDialog(
                                                            order,
                                                        )
                                                    }
                                                >
                                                    Edit Purchase
                                                    Order
                                                </DropdownMenuItem>

                                                <DropdownMenuItem>
                                                    Record Goods
                                                    Received
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem>
                                                    Cancel Purchase
                                                    Order
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <Link
                                                href={`/purchases/purchase-orders/${order.id}`}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Open purchase
                                                    order
                                                </span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Purchase Order Lifecycle
                    </CardTitle>

                    <CardDescription>
                        Purchase orders will move through these
                        stages as the purchasing process progresses.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-3 md:grid-cols-5">
                        {[
                            "Draft",
                            "Sent",
                            "Confirmed",
                            "Partially Received",
                            "Received",
                        ].map((status, index) => (
                            <div
                                key={status}
                                className="relative rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                        {index + 1}
                                    </div>

                                    <span className="text-sm font-medium">
                                        {status}
                                    </span>
                                </div>

                                {index < 4 && (
                                    <ChevronRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 bg-background text-muted-foreground md:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);

                    if (!open) {
                        resetForm();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingOrder
                                ? "Edit Purchase Order"
                                : "Create Purchase Order"}
                        </DialogTitle>

                        <DialogDescription>
                            {editingOrder
                                ? "Update the purchase order details and line items."
                                : "Create a purchase order for one of your vendors."}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="vendorId">
                                    Vendor
                                </Label>

                                <select
                                    id="vendorId"
                                    value={vendorId}
                                    onChange={(event) =>
                                        setVendorId(
                                            event.target.value,
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">
                                        Select vendor
                                    </option>

                                    {vendors.map((vendor) => (
                                        <option
                                            key={vendor.id}
                                            value={vendor.id}
                                        >
                                            {vendor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="warehouseId">
                                    Warehouse
                                </Label>

                                <select
                                    id="warehouseId"
                                    value={warehouseId}
                                    onChange={(event) =>
                                        setWarehouseId(
                                            event.target.value,
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">
                                        Select warehouse
                                    </option>

                                    {warehouses.map(
                                        (warehouse) => (
                                            <option
                                                key={
                                                    warehouse.id
                                                }
                                                value={
                                                    warehouse.id
                                                }
                                            >
                                                {warehouse.name}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="orderDate">
                                    Order Date
                                </Label>

                                <Input
                                    id="orderDate"
                                    type="date"
                                    value={orderDate}
                                    onChange={(event) =>
                                        setOrderDate(
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expectedDeliveryDate">
                                    Expected Delivery Date
                                </Label>

                                <Input
                                    id="expectedDeliveryDate"
                                    type="date"
                                    value={
                                        expectedDeliveryDate
                                    }
                                    onChange={(event) =>
                                        setExpectedDeliveryDate(
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">
                                        Order Items
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        Add the products and quantities
                                        being ordered.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addItem}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="grid gap-4 md:grid-cols-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>
                                                    Product
                                                </Label>

                                                <select
                                                    value={
                                                        item.productId
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "productId",
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    required
                                                >
                                                    <option value="">
                                                        Select product
                                                    </option>

                                                    {products.map(
                                                        (
                                                            product,
                                                        ) => (
                                                            <option
                                                                key={
                                                                    product.id
                                                                }
                                                                value={
                                                                    product.id
                                                                }
                                                            >
                                                                {
                                                                    product.name
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Quantity
                                                </Label>

                                                <Input
                                                    type="number"
                                                    min="0.001"
                                                    step="0.001"
                                                    value={
                                                        item.quantity
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "quantity",
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Unit Price
                                                </Label>

                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        item.unitPrice
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "unitPrice",
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Discount %
                                                </Label>

                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={
                                                        item.discountPercent
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "discountPercent",
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Tax %
                                                </Label>

                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={
                                                        item.taxPercent
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "taxPercent",
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="space-y-2 flex-1">
                                                <Label>
                                                    Description
                                                </Label>

                                                <Input
                                                    placeholder="Optional item description"
                                                    value={
                                                        item.description
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateItem(
                                                            index,
                                                            "description",
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="ml-4 text-destructive"
                                                    onClick={() =>
                                                        removeItem(
                                                            index,
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Notes
                                </Label>

                                <Textarea
                                    id="notes"
                                    placeholder="Add notes for this purchase order..."
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(
                                            event.target.value,
                                        )
                                    }
                                    rows={5}
                                />
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span>
                                            ₹{" "}
                                            {subtotal.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                },
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Discount
                                        </span>
                                        <span>
                                            ₹{" "}
                                            {discountAmount.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                },
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Tax
                                        </span>
                                        <span>
                                            ₹{" "}
                                            {taxAmount.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                },
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <Label htmlFor="shippingAmount">
                                            Shipping
                                        </Label>

                                        <Input
                                            id="shippingAmount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-32"
                                            value={
                                                shippingAmount
                                            }
                                            onChange={(event) =>
                                                setShippingAmount(
                                                    event.target
                                                        .value,
                                                )
                                            }
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between text-base font-semibold">
                                        <span>
                                            Total
                                        </span>
                                        <span>
                                            ₹{" "}
                                            {totalAmount.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                },
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setDialogOpen(false)
                                }
                            >
                                Cancel
                            </Button>

                            <Button type="submit">
                                {editingOrder
                                    ? "Update Purchase Order"
                                    : "Create Purchase Order"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}