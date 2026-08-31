"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Package,
    Plus,
    Search,
    MoreHorizontal,
    Download,
    Upload,
    SlidersHorizontal,
} from "lucide-react";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

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

import { Separator } from "@/components/ui/separator";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Product = {
    id: string;
    companyId: string;
    categoryId: string | null;
    sku: string;
    name: string;
    description?: string | null;
    productType: "stock" | "service" | "consumable" | "asset";
    status: "active" | "inactive" | "discontinued";
    unit: string;
    barcode: string | null;
    hsnCode: string | null;
    taxRate: string;
    costPrice: string;
    sellingPrice: string;
    minimumStock: string;
    maximumStock: string | null;
    reorderLevel: string;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
};

/*
 * IMPORTANT:
 *
 * companyId is intentionally NOT part of ProductForm.
 *
 * companyId comes from the authenticated user's JWT on the API side.
 */
type ProductForm = {
    sku: string;
    name: string;
    description: string;
    productType: Product["productType"];
    status: Product["status"];
    unit: string;
    barcode: string;
    hsnCode: string;
    taxRate: string;
    costPrice: string;
    sellingPrice: string;
    minimumStock: string;
    maximumStock: string;
    reorderLevel: string;
    imageUrl: string;
};

const initialForm: ProductForm = {
    sku: "",
    name: "",
    description: "",
    productType: "stock",
    status: "active",
    unit: "pcs",
    barcode: "",
    hsnCode: "",
    taxRate: "0",
    costPrice: "0",
    sellingPrice: "0",
    minimumStock: "0",
    maximumStock: "",
    reorderLevel: "0",
    imageUrl: "",
};

function productToForm(product: Product): ProductForm {
    return {
        sku: product.sku,
        name: product.name,
        description: product.description ?? "",
        productType: product.productType,
        status: product.status,
        unit: product.unit,
        barcode: product.barcode ?? "",
        hsnCode: product.hsnCode ?? "",
        taxRate: product.taxRate,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        minimumStock: product.minimumStock,
        maximumStock: product.maximumStock ?? "",
        reorderLevel: product.reorderLevel,
        imageUrl: product.imageUrl ?? "",
    };
}

function formToPayload(form: ProductForm) {
    return {
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        productType: form.productType,
        status: form.status,
        unit: form.unit.trim() || "pcs",
        barcode: form.barcode.trim() || undefined,
        hsnCode: form.hsnCode.trim() || undefined,
        taxRate: form.taxRate || "0",
        costPrice: form.costPrice || "0",
        sellingPrice: form.sellingPrice || "0",
        minimumStock: form.minimumStock || "0",
        maximumStock: form.maximumStock.trim() || undefined,
        reorderLevel: form.reorderLevel || "0",
        imageUrl: form.imageUrl.trim() || undefined,
    };
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function ProductStatusBadge({ status }: { status: Product["status"] }) {
    if (status === "active") {
        return <Badge>Active</Badge>;
    }

    if (status === "inactive") {
        return <Badge variant="secondary">Inactive</Badge>;
    }

    return <Badge variant="destructive">Discontinued</Badge>;
}

/* -------------------------------------------------------------------------- */
/* Shared form fields (used by both Add and Edit dialogs)                     */
/* -------------------------------------------------------------------------- */

function ProductFormFields({
    idPrefix,
    form,
    onChange,
}: {
    idPrefix: string;
    form: ProductForm;
    onChange: <K extends keyof ProductForm>(field: K, value: ProductForm[K]) => void;
}) {
    return (
        <>
            {/* Basic Information */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">
                        Basic identification and classification of the product.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-sku`}>SKU *</Label>
                        <Input
                            id={`${idPrefix}-sku`}
                            value={form.sku}
                            onChange={(event) => onChange("sku", event.target.value)}
                            placeholder="PROD-001"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-name`}>Product Name *</Label>
                        <Input
                            id={`${idPrefix}-name`}
                            value={form.name}
                            onChange={(event) => onChange("name", event.target.value)}
                            placeholder="Laptop"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`${idPrefix}-description`}>Description</Label>
                    <Textarea
                        id={`${idPrefix}-description`}
                        value={form.description}
                        onChange={(event) => onChange("description", event.target.value)}
                        placeholder="Product description..."
                        rows={3}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-productType`}>Product Type</Label>
                        <select
                            id={`${idPrefix}-productType`}
                            value={form.productType}
                            onChange={(event) =>
                                onChange("productType", event.target.value as Product["productType"])
                            }
                            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="stock">Stock</option>
                            <option value="service">Service</option>
                            <option value="consumable">Consumable</option>
                            <option value="asset">Asset</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-unit`}>Unit</Label>
                        <Input
                            id={`${idPrefix}-unit`}
                            value={form.unit}
                            onChange={(event) => onChange("unit", event.target.value)}
                            placeholder="pcs"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-status`}>Status</Label>
                        <select
                            id={`${idPrefix}-status`}
                            value={form.status}
                            onChange={(event) =>
                                onChange("status", event.target.value as Product["status"])
                            }
                            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="discontinued">Discontinued</option>
                        </select>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Identification */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Product Identification</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-barcode`}>Barcode</Label>
                        <Input
                            id={`${idPrefix}-barcode`}
                            value={form.barcode}
                            onChange={(event) => onChange("barcode", event.target.value)}
                            placeholder="8901234567890"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-hsnCode`}>HSN Code</Label>
                        <Input
                            id={`${idPrefix}-hsnCode`}
                            value={form.hsnCode}
                            onChange={(event) => onChange("hsnCode", event.target.value)}
                            placeholder="8471"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-taxRate`}>Tax Rate (%)</Label>
                        <Input
                            id={`${idPrefix}-taxRate`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.taxRate}
                            onChange={(event) => onChange("taxRate", event.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Pricing</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-costPrice`}>Cost Price</Label>
                        <Input
                            id={`${idPrefix}-costPrice`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.costPrice}
                            onChange={(event) => onChange("costPrice", event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-sellingPrice`}>Selling Price</Label>
                        <Input
                            id={`${idPrefix}-sellingPrice`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.sellingPrice}
                            onChange={(event) => onChange("sellingPrice", event.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Inventory Configuration */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Inventory Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure stock thresholds for this product.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-minimumStock`}>Minimum Stock</Label>
                        <Input
                            id={`${idPrefix}-minimumStock`}
                            type="number"
                            min="0"
                            step="0.001"
                            value={form.minimumStock}
                            onChange={(event) => onChange("minimumStock", event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-maximumStock`}>Maximum Stock</Label>
                        <Input
                            id={`${idPrefix}-maximumStock`}
                            type="number"
                            min="0"
                            step="0.001"
                            value={form.maximumStock}
                            onChange={(event) => onChange("maximumStock", event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${idPrefix}-reorderLevel`}>Reorder Level</Label>
                        <Input
                            id={`${idPrefix}-reorderLevel`}
                            type="number"
                            min="0"
                            step="0.001"
                            value={form.reorderLevel}
                            onChange={(event) => onChange("reorderLevel", event.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Image */}
            <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-imageUrl`}>Image URL</Label>
                <Input
                    id={`${idPrefix}-imageUrl`}
                    value={form.imageUrl}
                    onChange={(event) => onChange("imageUrl", event.target.value)}
                    placeholder="https://..."
                />
            </div>
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<ProductForm>(initialForm);
    const [createError, setCreateError] = useState("");

    // Edit
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState<ProductForm>(initialForm);
    const [updating, setUpdating] = useState(false);
    const [editError, setEditError] = useState("");

    // Delete
    const [deletingId, setDeletingId] = useState<string | null>(null);

    /* ---------------------------------------------------------------------- */
    /* Fetch Products                                                         */
    /* ---------------------------------------------------------------------- */

    async function fetchProducts() {
        try {
            setLoading(true);
            setError("");

            const data = await apiGet<Product[]>("/api/inventory/products");
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Create Product                                                         */
    /* ---------------------------------------------------------------------- */

    function updateForm<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setCreating(true);
            setCreateError("");

            const createdProduct = await apiPost<Product, ReturnType<typeof formToPayload>>(
                "/api/inventory/products",
                formToPayload(form),
            );

            setProducts((current) => [createdProduct, ...current]);
            setForm(initialForm);
            setDialogOpen(false);
        } catch (error) {
            console.error("Failed to create product:", error);
            setCreateError(error instanceof Error ? error.message : "Failed to create product");
        } finally {
            setCreating(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Edit Product                                                           */
    /* ---------------------------------------------------------------------- */

    function updateEditForm<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
        setEditForm((current) => ({ ...current, [field]: value }));
    }

    function openEditDialog(product: Product) {
        setEditingProduct(product);
        setEditForm(productToForm(product));
        setEditError("");
        setEditDialogOpen(true);
    }

    async function handleUpdateProduct(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editingProduct) {
            return;
        }

        try {
            setUpdating(true);
            setEditError("");

            const updatedProduct = await apiPut<Product, ReturnType<typeof formToPayload>>(
                `/api/inventory/products/${editingProduct.id}`,
                formToPayload(editForm),
            );

            setProducts((current) =>
                current.map((product) =>
                    product.id === updatedProduct.id ? updatedProduct : product,
                ),
            );

            setEditDialogOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error("Failed to update product:", error);
            setEditError(error instanceof Error ? error.message : "Failed to update product");
        } finally {
            setUpdating(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Delete Product                                                         */
    /* ---------------------------------------------------------------------- */

    async function handleDeleteProduct(product: Product) {
        const confirmed = window.confirm(
            `Delete "${product.name}"? This can't be undone.`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(product.id);
            setError("");

            await apiDelete(`/api/inventory/products/${product.id}`);

            setProducts((current) =>
                current.filter((item) => item.id !== product.id),
            );
        } catch (error) {
            console.error("Failed to delete product:", error);
            setError(error instanceof Error ? error.message : "Failed to delete product");
        } finally {
            setDeletingId(null);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Search                                                                 */
    /* ---------------------------------------------------------------------- */

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return products;
        }

        return products.filter((product) => {
            return (
                product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query) ||
                product.unit.toLowerCase().includes(query) ||
                product.barcode?.toLowerCase().includes(query) ||
                product.hsnCode?.toLowerCase().includes(query)
            );
        });
    }, [products, search]);

    /* ---------------------------------------------------------------------- */
    /* Statistics                                                             */
    /* ---------------------------------------------------------------------- */

    const totalProducts = products.length;

    const activeProducts = products.filter(
        (product) => product.status === "active",
    ).length;

    /*
     * Current stock quantity does NOT exist in products.
     * It belongs to stockBalances, so low/out-of-stock stay at 0
     * until that's wired in separately.
     */
    const lowStockProducts = 0;
    const outOfStockProducts = 0;

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage your products, pricing, units, and inventory information.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                    </Button>

                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-h-[90vh] w-[65vw] max-w-[65vw] overflow-y-auto sm:max-w-[65vw]">
                            <DialogHeader>
                                <DialogTitle>Add Product</DialogTitle>
                                <DialogDescription>
                                    Create a new product in your inventory catalog.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleCreateProduct} className="space-y-6">
                                <ProductFormFields
                                    idPrefix="create"
                                    form={form}
                                    onChange={updateForm}
                                />

                                {createError && (
                                    <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        {createError}
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        disabled={creating}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={creating || !form.sku.trim() || !form.name.trim()}
                                    >
                                        {creating ? "Creating..." : "Create Product"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit dialog — opened via the row dropdown, no trigger button here */}
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent className="max-h-[90vh] w-[65vw] max-w-[65vw] overflow-y-auto sm:max-w-[65vw]">
                            <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>
                                    Update details for {editingProduct?.name}.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleUpdateProduct} className="space-y-6">
                                <ProductFormFields
                                    idPrefix="edit"
                                    form={editForm}
                                    onChange={updateEditForm}
                                />

                                {editError && (
                                    <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        {editError}
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditDialogOpen(false)}
                                        disabled={updating}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={
                                            updating ||
                                            !editForm.sku.trim() ||
                                            !editForm.name.trim()
                                        }
                                    >
                                        {updating ? "Saving..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">Products in your catalog</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProducts}</div>
                        <p className="text-xs text-muted-foreground">Currently available products</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockProducts}</div>
                        <p className="text-xs text-muted-foreground">Products below reorder level</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{outOfStockProducts}</div>
                        <p className="text-xs text-muted-foreground">Products currently unavailable</p>
                    </CardContent>
                </Card>
            </div>

            {/* Product Directory */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle>Product Catalog</CardTitle>
                            <CardDescription>
                                View and manage all products maintained in your inventory.
                            </CardDescription>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>

                            <Button variant="outline" size="icon">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span className="sr-only">Filter products</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-0">
                    {error && (
                        <div className="mx-6 mt-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex min-h-[360px] items-center justify-center">
                            <p className="text-sm text-muted-foreground">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <Package className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <div className="max-w-md">
                                <h3 className="font-semibold">
                                    {search ? "No products found" : "No products yet"}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search
                                        ? "Try changing your search term."
                                        : "Add products to start managing your catalog, inventory levels, purchasing, and sales."}
                                </p>
                            </div>

                            {!search && (
                                <Button onClick={() => setDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">Product</th>
                                        <th className="px-6 py-3 text-left font-medium">SKU</th>
                                        <th className="px-6 py-3 text-left font-medium">Type</th>
                                        <th className="px-6 py-3 text-left font-medium">Unit</th>
                                        <th className="px-6 py-3 text-left font-medium">Cost Price</th>
                                        <th className="px-6 py-3 text-left font-medium">Selling Price</th>
                                        <th className="px-6 py-3 text-left font-medium">Status</th>
                                        <th className="w-12 px-6 py-3" />
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    {product.description && (
                                                        <div className="max-w-xs truncate text-xs text-muted-foreground">
                                                            {product.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-mono text-xs">{product.sku}</td>
                                            <td className="px-6 py-4 capitalize">{product.productType}</td>
                                            <td className="px-6 py-4">{product.unit}</td>
                                            <td className="px-6 py-4">
                                                ₹{Number(product.costPrice).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                ₹{Number(product.sellingPrice).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <ProductStatusBadge status={product.status} />
                                            </td>

                                            <td className="px-6 py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={deletingId === product.id}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Product actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => openEditDialog(product)}
                                                        >
                                                            Edit Product
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDeleteProduct(product)}
                                                        >
                                                            {deletingId === product.id
                                                                ? "Deleting..."
                                                                : "Delete Product"}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}