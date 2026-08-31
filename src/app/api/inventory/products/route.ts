import { NextRequest } from "next/server";
import { and, eq, ilike } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/inventory-schema";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

// GET /api/inventory/products
export async function GET(request: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(request);

        if (!auth?.companyId) {
            return errorResponse(
                "Company ID is required",
                "COMPANY_ID_REQUIRED",
                400,
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const status = searchParams.get("status");

        const conditions = [eq(products.companyId, auth.companyId)];

        if (search) {
            conditions.push(ilike(products.name, `%${search}%`));
        }

        if (status) {
            conditions.push(
                eq(
                    products.status,
                    status as "active" | "inactive" | "discontinued",
                ),
            );
        }

        const result = await db
            .select()
            .from(products)
            .where(and(...conditions))
            .orderBy(products.name);

        return successResponse(result, "Products fetched successfully");
    } catch (error) {
        console.error("GET /api/inventory/products error:", error);

        return errorResponse(
            "Failed to fetch products",
            "PRODUCTS_FETCH_FAILED",
            500,
            error instanceof Error ? error.message : error,
        );
    }
}

// POST /api/inventory/products
export async function POST(request: NextRequest) {
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

        // Check for duplicate SKU
        const existingSku = await db
            .select({ id: products.id })
            .from(products)
            .where(
                and(
                    eq(products.companyId, companyId),
                    eq(products.sku, sku),
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

        // Check for duplicate barcode
        if (barcode) {
            const existingBarcode = await db
                .select({ id: products.id })
                .from(products)
                .where(
                    and(
                        eq(products.companyId, companyId),
                        eq(products.barcode, barcode),
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

        const [product] = await db
            .insert(products)
            .values({
                companyId,
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
            })
            .returning();

        return successResponse(product, "Product created successfully", 201);
    } catch (error) {
        console.error("POST /api/inventory/products error:", error);

        return errorResponse(
            "Failed to create product",
            "PRODUCT_CREATE_FAILED",
            500,
            error instanceof Error ? error.message : error,
        );
    }
}