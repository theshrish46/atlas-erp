import { NextRequest } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
    purchaseOrders,
    purchaseOrderItems,
    vendors,
} from "@/lib/db/schema/purchases-schema";
import {
    employees,
} from "@/lib/db/schema/profile-schema";
import {
    products,
    warehouses,
} from "@/lib/db/schema/inventory-schema";
import {
    documentCounters,
} from "@/lib/db/schema/document-counter-schema";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils/api-response";

function calculateLineTotal(
    quantity: number,
    unitPrice: number,
    discountPercent: number,
    taxPercent: number
) {
    const gross = quantity * unitPrice;
    const discount = gross * (discountPercent / 100);
    const taxable = gross - discount;
    const tax = taxable * (taxPercent / 100);

    return {
        discount,
        tax,
        lineTotal: taxable + tax,
    };
}

export async function GET(request: NextRequest) {
    try {
        const authenticatedUser =
            await getAuthenticatedUser(request);

        if (!authenticatedUser) {
            return errorResponse(
                "Unauthorized",
                "UNAUTHORIZED",
                401
            );
        }

        const employee =
            await db.query.employees.findFirst({
                where: eq(
                    employees.userId,
                    authenticatedUser.userId
                ),
                columns: {
                    companyId: true,
                },
            });

        if (!employee) {
            return errorResponse(
                "Employee profile not found",
                "EMPLOYEE_NOT_FOUND",
                404
            );
        }

        const searchParams =
            request.nextUrl.searchParams;

        const search =
            searchParams
                .get("search")
                ?.trim()
                .toLowerCase();

        const status =
            searchParams.get("status");

        const conditions = [
            eq(
                purchaseOrders.companyId,
                employee.companyId
            ),
        ];

        if (
            status === "draft" ||
            status === "sent" ||
            status === "confirmed" ||
            status === "partially_received" ||
            status === "received" ||
            status === "cancelled"
        ) {
            conditions.push(
                eq(
                    purchaseOrders.status,
                    status
                )
            );
        }

        const result = await db
            .select({
                id: purchaseOrders.id,
                orderNumber:
                    purchaseOrders.purchaseOrderNumber,
                vendorId:
                    purchaseOrders.vendorId,
                vendorName: vendors.name,
                vendorCode: vendors.vendorCode,
                orderDate:
                    purchaseOrders.orderDate,
                expectedDate:
                    purchaseOrders.expectedDeliveryDate,
                status: purchaseOrders.status,
                subtotal:
                    purchaseOrders.subtotal,
                discountAmount:
                    purchaseOrders.discountAmount,
                taxAmount:
                    purchaseOrders.taxAmount,
                shippingAmount:
                    purchaseOrders.shippingAmount,
                totalAmount:
                    purchaseOrders.totalAmount,
                warehouseId:
                    purchaseOrders.warehouseId,
                notes:
                    purchaseOrders.notes,
                createdAt:
                    purchaseOrders.createdAt,
                updatedAt:
                    purchaseOrders.updatedAt,
            })
            .from(purchaseOrders)
            .innerJoin(
                vendors,
                eq(
                    purchaseOrders.vendorId,
                    vendors.id
                )
            )
            .where(and(...conditions))
            .orderBy(
                desc(purchaseOrders.createdAt)
            );

        const filteredResult = search
            ? result.filter((order) =>
                [
                    order.orderNumber,
                    order.vendorName,
                    order.vendorCode,
                    order.status,
                ].some((value) =>
                    value
                        ?.toLowerCase()
                        .includes(search)
                )
            )
            : result;

        const totalOrders =
            filteredResult.length;

        const draftOrders =
            filteredResult.filter(
                (order) =>
                    order.status === "draft"
            ).length;

        const awaitingFulfillment =
            filteredResult.filter(
                (order) =>
                    order.status === "sent" ||
                    order.status === "confirmed"
            ).length;

        const partiallyReceivedOrders =
            filteredResult.filter(
                (order) =>
                    order.status ===
                    "partially_received"
            ).length;

        const totalPurchaseValue =
            filteredResult.reduce(
                (total, order) =>
                    total +
                    Number(order.totalAmount),
                0
            );

        return successResponse(
            {
                purchaseOrders:
                    filteredResult,
                statistics: {
                    totalOrders,
                    draftOrders,
                    awaitingFulfillment,
                    partiallyReceivedOrders,
                    totalPurchaseValue,
                },
            },
            "Purchase orders fetched successfully",
            200
        );
    } catch (error) {
        console.error(
            "GET /api/purchases/purchase-orders error:",
            error
        );

        return errorResponse(
            "Failed to fetch purchase orders",
            "PURCHASE_ORDERS_FETCH_FAILED",
            500
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authenticatedUser =
            await getAuthenticatedUser(request);

        if (!authenticatedUser) {
            return errorResponse(
                "Unauthorized",
                "UNAUTHORIZED",
                401
            );
        }

        const employee =
            await db.query.employees.findFirst({
                where: eq(
                    employees.userId,
                    authenticatedUser.userId
                ),
                columns: {
                    id: true,
                    companyId: true,
                },
            });

        if (!employee) {
            return errorResponse(
                "Employee profile not found",
                "EMPLOYEE_NOT_FOUND",
                404
            );
        }

        const body = await request.json();

        const {
            vendorId,
            orderDate,
            expectedDeliveryDate,
            warehouseId,
            notes,
            shippingAmount,
            items,
        } = body;

        if (!vendorId) {
            return errorResponse(
                "Vendor is required",
                "VENDOR_REQUIRED",
                400
            );
        }

        if (!warehouseId) {
            return errorResponse(
                "Warehouse is required",
                "WAREHOUSE_REQUIRED",
                400
            );
        }

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return errorResponse(
                "At least one purchase order item is required",
                "PURCHASE_ORDER_ITEMS_REQUIRED",
                400
            );
        }

        const vendor =
            await db.query.vendors.findFirst({
                where: and(
                    eq(
                        vendors.id,
                        vendorId
                    ),
                    eq(
                        vendors.companyId,
                        employee.companyId
                    )
                ),
                columns: {
                    id: true,
                    name: true,
                },
            });

        if (!vendor) {
            return errorResponse(
                "Vendor not found",
                "VENDOR_NOT_FOUND",
                404
            );
        }

        const warehouse =
            await db.query.warehouses.findFirst({
                where: and(
                    eq(
                        warehouses.id,
                        warehouseId
                    ),
                    eq(
                        warehouses.companyId,
                        employee.companyId
                    )
                ),
                columns: {
                    id: true,
                },
            });

        if (!warehouse) {
            return errorResponse(
                "Warehouse not found",
                "WAREHOUSE_NOT_FOUND",
                404
            );
        }

        const productIds = items.map(
            (item: {
                productId: string;
            }) => item.productId
        );

        const companyProducts =
            await db
                .select({
                    id: products.id,
                })
                .from(products)
                .where(
                    and(
                        eq(
                            products.companyId,
                            employee.companyId
                        ),
                        sql`${products.id} IN ${productIds}`
                    )
                );

        const validProductIds =
            new Set(
                companyProducts.map(
                    (product) => product.id
                )
            );

        for (const item of items) {
            if (
                !item.productId ||
                !validProductIds.has(
                    item.productId
                )
            ) {
                return errorResponse(
                    "One or more products are invalid",
                    "INVALID_PRODUCT",
                    400
                );
            }

            if (
                Number(item.quantity) <= 0
            ) {
                return errorResponse(
                    "Quantity must be greater than zero",
                    "INVALID_QUANTITY",
                    400
                );
            }

            if (
                Number(item.unitPrice) < 0
            ) {
                return errorResponse(
                    "Unit price cannot be negative",
                    "INVALID_UNIT_PRICE",
                    400
                );
            }
        }

        const result =
            await db.transaction(async (tx) => {
                const [counter] =
                    await tx
                        .insert(documentCounters)
                        .values({
                            companyId:
                                employee.companyId,
                            documentType:
                                "purchase_order",
                            currentValue: 1,
                        })
                        .onConflictDoUpdate({
                            target: [
                                documentCounters.companyId,
                                documentCounters.documentType,
                            ],
                            set: {
                                currentValue:
                                    sql`${documentCounters.currentValue} + 1`,
                                updatedAt:
                                    new Date(),
                            },
                        })
                        .returning({
                            currentValue:
                                documentCounters.currentValue,
                        });

                if (!counter) {
                    throw new Error(
                        "Failed to generate purchase order number"
                    );
                }

                const purchaseOrderNumber =
                    `PO-${String(
                        counter.currentValue
                    ).padStart(6, "0")}`;

                let subtotal = 0;
                let discountTotal = 0;
                let taxTotal = 0;

                const preparedItems =
                    items.map(
                        (item: {
                            productId: string;
                            description?: string;
                            quantity: number | string;
                            unitPrice: number | string;
                            discountPercent?: number | string;
                            taxPercent?: number | string;
                        }) => {
                            const quantity =
                                Number(
                                    item.quantity
                                );

                            const unitPrice =
                                Number(
                                    item.unitPrice
                                );

                            const discountPercent =
                                Number(
                                    item.discountPercent ??
                                    0
                                );

                            const taxPercent =
                                Number(
                                    item.taxPercent ??
                                    0
                                );

                            const calculated =
                                calculateLineTotal(
                                    quantity,
                                    unitPrice,
                                    discountPercent,
                                    taxPercent
                                );

                            const gross =
                                quantity *
                                unitPrice;

                            subtotal += gross;
                            discountTotal +=
                                calculated.discount;
                            taxTotal +=
                                calculated.tax;

                            return {
                                productId:
                                    item.productId,
                                description:
                                    item.description
                                        ?.trim() ||
                                    null,
                                quantity:
                                    quantity.toFixed(
                                        3
                                    ),
                                receivedQuantity:
                                    "0",
                                unitPrice:
                                    unitPrice.toFixed(
                                        2
                                    ),
                                discountPercent:
                                    discountPercent.toFixed(
                                        2
                                    ),
                                taxPercent:
                                    taxPercent.toFixed(
                                        2
                                    ),
                                lineTotal:
                                    calculated.lineTotal.toFixed(
                                        2
                                    ),
                            };
                        }
                    );

                const shipping =
                    Number(
                        shippingAmount ?? 0
                    );

                const totalAmount =
                    subtotal -
                    discountTotal +
                    taxTotal +
                    shipping;

                const [createdOrder] =
                    await tx
                        .insert(purchaseOrders)
                        .values({
                            companyId:
                                employee.companyId,
                            vendorId,
                            createdBy:
                                employee.id,
                            purchaseOrderNumber,
                            orderDate:
                                orderDate
                                    ? new Date(
                                        orderDate
                                    )
                                    : new Date(),
                            expectedDeliveryDate:
                                expectedDeliveryDate
                                    ? new Date(
                                        expectedDeliveryDate
                                    )
                                    : null,
                            status: "draft",
                            subtotal:
                                subtotal.toFixed(
                                    2
                                ),
                            discountAmount:
                                discountTotal.toFixed(
                                    2
                                ),
                            taxAmount:
                                taxTotal.toFixed(
                                    2
                                ),
                            shippingAmount:
                                shipping.toFixed(
                                    2
                                ),
                            totalAmount:
                                totalAmount.toFixed(
                                    2
                                ),
                            warehouseId,
                            notes:
                                notes?.trim() ||
                                null,
                        })
                        .returning();

                if (!createdOrder) {
                    throw new Error(
                        "Failed to create purchase order"
                    );
                }

                await tx
                    .insert(purchaseOrderItems)
                    .values(
                        preparedItems.map(
                            (item) => ({
                                purchaseOrderId:
                                    createdOrder.id,
                                ...item,
                            })
                        )
                    );

                return createdOrder;
            });

        return successResponse(
            {
                purchaseOrder: result,
            },
            "Purchase order created successfully",
            201
        );
    } catch (error) {
        console.error(
            "POST /api/purchases/purchase-orders error:",
            error
        );

        return errorResponse(
            "Failed to create purchase order",
            "PURCHASE_ORDER_CREATION_FAILED",
            500
        );
    }
}