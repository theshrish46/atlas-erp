import { NextRequest } from "next/server";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/inventory-schema";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

type RouteParams = {
    params: Promise<{
        productId: string;
    }>;
};

// PUT /api/inventory/products/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await getAuthenticatedUser(request);

        if (!auth?.companyId) {
            return errorResponse(
                "Company ID is required",
                "COMPANY_ID_REQUIRED",
                400,
            );
        }

        const companyId = auth.companyId;
        const { productId } = await params;
        const body = await request.json();

        const {
            categoryId,
            sku,
            name,
            description,
            productType,
            status,
            unit,
            barcode,
            hsnCode,
            taxRate,
            costPrice,
            sellingPrice,
            minimumStock,
            maximumStock,
            reorderLevel,
            imageUrl,
        } = body;

        if (!sku) {
            return errorResponse("SKU is required", "SKU_REQUIRED", 400);
        }

        if (!name) {
            return errorResponse(
                "Product name is required",
                "PRODUCT_NAME_REQUIRED",
                400,
            );
        }

        const [existingProduct] = await db
            .select({ id: products.id })
            .from(products)
            .where(
                and(
                    eq(products.id, productId),
                    eq(products.companyId, companyId),
                ),
            )
            .limit(1);

        if (!existingProduct) {
            return errorResponse("Product not found", "PRODUCT_NOT_FOUND", 404);
        }

        // Duplicate SKU check, excluding this product itself
        const existingSku = await db
            .select({ id: products.id })
            .from(products)
            .where(
                and(
                    eq(products.companyId, companyId),
                    eq(products.sku, sku),
                    ne(products.id, productId),
                ),
            )
            .limit(1);

        if (existingSku.length > 0) {
            return errorResponse(
                "A product with this SKU already exists",
                "DUPLICATE_SKU",
                409,
            );
        }

        // Duplicate barcode check, excluding this product itself
        if (barcode) {
            const existingBarcode = await db
                .select({ id: products.id })
                .from(products)
                .where(
                    and(
                        eq(products.companyId, companyId),
                        eq(products.barcode, barcode),
                        ne(products.id, productId),
                    ),
                )
                .limit(1);

            if (existingBarcode.length > 0) {
                return errorResponse(
                    "A product with this barcode already exists",
                    "DUPLICATE_BARCODE",
                    409,
                );
            }
        }

        const [updatedProduct] = await db
            .update(products)
            .set({
                categoryId: categoryId || null,
                sku,
                name,
                description: description || null,
                productType: productType || "stock",
                status: status || "active",
                unit: unit || "pcs",
                barcode: barcode || null,
                hsnCode: hsnCode || null,
                taxRate: taxRate ?? "0",
                costPrice: costPrice ?? "0",
                sellingPrice: sellingPrice ?? "0",
                minimumStock: minimumStock ?? "0",
                maximumStock: maximumStock ?? null,
                reorderLevel: reorderLevel ?? "0",
                imageUrl: imageUrl || null,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(products.id, productId),
                    eq(products.companyId, companyId),
                ),
            )
            .returning();

        return successResponse(updatedProduct, "Product updated successfully");
    } catch (error) {
        console.error("PUT /api/inventory/products/[id] error:", error);

        return errorResponse(
            "Failed to update product",
            "PRODUCT_UPDATE_FAILED",
            500,
            error instanceof Error ? error.message : error,
        );
    }
}

// DELETE /api/inventory/products/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await getAuthenticatedUser(request);

        if (!auth?.companyId) {
            return errorResponse(
                "Company ID is required",
                "COMPANY_ID_REQUIRED",
                400,
            );
        }

        const companyId = auth.companyId;
        const { productId } = await params;

        const [existingProduct] = await db
            .select({ id: products.id })
            .from(products)
            .where(
                and(
                    eq(products.id, productId),
                    eq(products.companyId, companyId),
                ),
            )
            .limit(1);

        if (!existingProduct) {
            return errorResponse("Product not found", "PRODUCT_NOT_FOUND", 404);
        }

        await db
            .delete(products)
            .where(
                and(
                    eq(products.id, productId),
                    eq(products.companyId, companyId),
                ),
            );

        return successResponse({ id: productId }, "Product deleted successfully");
    } catch (error: any) {
        console.error("DELETE /api/inventory/products/[id] error:", error);

        // Postgres FK violation — every line item table references products
        // with onDelete: "restrict", so this fires whenever the product has
        // any stock, purchase, or sales history.
        if (error?.code === "23503") {
            return errorResponse(
                "This product is used in stock, purchase, or sales records and can't be deleted. Set it to inactive instead.",
                "PRODUCT_IN_USE",
                409,
            );
        }

        return errorResponse(
            "Failed to delete product",
            "PRODUCT_DELETE_FAILED",
            500,
            error instanceof Error ? error.message : error,
        );
    }
}