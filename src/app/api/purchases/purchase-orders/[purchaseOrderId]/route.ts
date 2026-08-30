import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";

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
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils/api-response";

type RouteContext = {
    params: Promise<{
        purchaseOrderId: string;
    }>;
};

function calculateLineTotal(
    quantity: number,
    unitPrice: number,
    discountPercent: number,
    taxPercent: number
) {
    const gross =
        quantity * unitPrice;

    const discount =
        gross *
        (discountPercent / 100);

    const taxable =
        gross - discount;

    const tax =
        taxable *
        (taxPercent / 100);

    return {
        discount,
        tax,
        lineTotal:
            taxable + tax,
    };
}

async function getEmployee(
    request: NextRequest
) {
    const authenticatedUser =
        await getAuthenticatedUser(request);

    if (!authenticatedUser) {
        return null;
    }

    return db.query.employees.findFirst({
        where: eq(
            employees.userId,
            authenticatedUser.userId
        ),
        columns: {
            id: true,
            companyId: true,
        },
    });
}

export async function GET(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const employee =
            await getEmployee(request);

        if (!employee) {
            return errorResponse(
                "Unauthorized",
                "UNAUTHORIZED",
                401
            );
        }

        const { purchaseOrderId } =
            await params;

        if (!purchaseOrderId) {
            return errorResponse(
                "Purchase order ID is required",
                "PURCHASE_ORDER_ID_REQUIRED",
                400
            );
        }

        const [purchaseOrder] =
            await db
                .select({
                    id: purchaseOrders.id,
                    companyId:
                        purchaseOrders.companyId,
                    purchaseOrderNumber:
                        purchaseOrders.purchaseOrderNumber,
                    vendorId:
                        purchaseOrders.vendorId,
                    vendorName:
                        vendors.name,
                    vendorCode:
                        vendors.vendorCode,
                    createdBy:
                        purchaseOrders.createdBy,
                    orderDate:
                        purchaseOrders.orderDate,
                    expectedDeliveryDate:
                        purchaseOrders.expectedDeliveryDate,
                    status:
                        purchaseOrders.status,
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
                .where(
                    and(
                        eq(
                            purchaseOrders.id,
                            purchaseOrderId
                        ),
                        eq(
                            purchaseOrders.companyId,
                            employee.companyId
                        )
                    )
                );

        if (!purchaseOrder) {
            return errorResponse(
                "Purchase order not found",
                "PURCHASE_ORDER_NOT_FOUND",
                404
            );
        }

        const items =
            await db
                .select({
                    id:
                        purchaseOrderItems.id,
                    purchaseOrderId:
                        purchaseOrderItems.purchaseOrderId,
                    productId:
                        purchaseOrderItems.productId,
                    productName:
                        products.name,
                    description:
                        purchaseOrderItems.description,
                    quantity:
                        purchaseOrderItems.quantity,
                    receivedQuantity:
                        purchaseOrderItems.receivedQuantity,
                    unitPrice:
                        purchaseOrderItems.unitPrice,
                    discountPercent:
                        purchaseOrderItems.discountPercent,
                    taxPercent:
                        purchaseOrderItems.taxPercent,
                    lineTotal:
                        purchaseOrderItems.lineTotal,
                })
                .from(purchaseOrderItems)
                .innerJoin(
                    products,
                    eq(
                        purchaseOrderItems.productId,
                        products.id
                    )
                )
                .where(
                    eq(
                        purchaseOrderItems.purchaseOrderId,
                        purchaseOrderId
                    )
                );

        return successResponse(
            {
                purchaseOrder: {
                    ...purchaseOrder,
                    items,
                },
            },
            "Purchase order fetched successfully",
            200
        );
    } catch (error) {
        console.error(
            "GET /api/purchases/purchase-orders/[purchaseOrderId] error:",
            error
        );

        return errorResponse(
            "Failed to fetch purchase order",
            "PURCHASE_ORDER_FETCH_FAILED",
            500
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const employee =
            await getEmployee(request);

        if (!employee) {
            return errorResponse(
                "Unauthorized",
                "UNAUTHORIZED",
                401
            );
        }

        const { purchaseOrderId } =
            await params;

        if (!purchaseOrderId) {
            return errorResponse(
                "Purchase order ID is required",
                "PURCHASE_ORDER_ID_REQUIRED",
                400
            );
        }

        const existingOrder =
            await db.query.purchaseOrders.findFirst({
                where: and(
                    eq(
                        purchaseOrders.id,
                        purchaseOrderId
                    ),
                    eq(
                        purchaseOrders.companyId,
                        employee.companyId
                    )
                ),
            });

        if (!existingOrder) {
            return errorResponse(
                "Purchase order not found",
                "PURCHASE_ORDER_NOT_FOUND",
                404
            );
        }

        if (
            existingOrder.status !== "draft"
        ) {
            return errorResponse(
                "Only draft purchase orders can be edited",
                "PURCHASE_ORDER_NOT_EDITABLE",
                400
            );
        }

        const body =
            await request.json();

        const {
            vendorId,
            orderDate,
            expectedDeliveryDate,
            warehouseId,
            notes,
            shippingAmount,
            status,
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

        const productIds =
            items.map(
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

                            subtotal +=
                                quantity *
                                unitPrice;

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

                const [updatedOrder] =
                    await tx
                        .update(purchaseOrders)
                        .set({
                            vendorId,
                            orderDate:
                                orderDate
                                    ? new Date(
                                        orderDate
                                    )
                                    : existingOrder.orderDate,
                            expectedDeliveryDate:
                                expectedDeliveryDate
                                    ? new Date(
                                        expectedDeliveryDate
                                    )
                                    : null,
                            status:
                                status ===
                                    "draft" ||
                                    status === "sent"
                                    ? status
                                    : existingOrder.status,
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
                            updatedAt:
                                new Date(),
                        })
                        .where(
                            and(
                                eq(
                                    purchaseOrders.id,
                                    purchaseOrderId
                                ),
                                eq(
                                    purchaseOrders.companyId,
                                    employee.companyId
                                )
                            )
                        )
                        .returning();

                if (!updatedOrder) {
                    throw new Error(
                        "Failed to update purchase order"
                    );
                }

                await tx
                    .delete(
                        purchaseOrderItems
                    )
                    .where(
                        eq(
                            purchaseOrderItems.purchaseOrderId,
                            purchaseOrderId
                        )
                    );

                await tx
                    .insert(purchaseOrderItems)
                    .values(
                        preparedItems.map(
                            (item) => ({
                                purchaseOrderId,
                                ...item,
                            })
                        )
                    );

                return updatedOrder;
            });

        return successResponse(
            {
                purchaseOrder: result,
            },
            "Purchase order updated successfully",
            200
        );
    } catch (error) {
        console.error(
            "PUT /api/purchases/purchase-orders/[purchaseOrderId] error:",
            error
        );

        return errorResponse(
            "Failed to update purchase order",
            "PURCHASE_ORDER_UPDATE_FAILED",
            500
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const employee =
            await getEmployee(request);

        if (!employee) {
            return errorResponse(
                "Unauthorized",
                "UNAUTHORIZED",
                401
            );
        }

        const { purchaseOrderId } =
            await params;

        if (!purchaseOrderId) {
            return errorResponse(
                "Purchase order ID is required",
                "PURCHASE_ORDER_ID_REQUIRED",
                400
            );
        }

        const existingOrder =
            await db.query.purchaseOrders.findFirst({
                where: and(
                    eq(
                        purchaseOrders.id,
                        purchaseOrderId
                    ),
                    eq(
                        purchaseOrders.companyId,
                        employee.companyId
                    )
                ),
                columns: {
                    id: true,
                    status: true,
                },
            });

        if (!existingOrder) {
            return errorResponse(
                "Purchase order not found",
                "PURCHASE_ORDER_NOT_FOUND",
                404
            );
        }

        if (
            existingOrder.status !== "draft"
        ) {
            return errorResponse(
                "Only draft purchase orders can be deleted",
                "PURCHASE_ORDER_NOT_DELETABLE",
                400
            );
        }

        const [deletedOrder] =
            await db
                .delete(purchaseOrders)
                .where(
                    and(
                        eq(
                            purchaseOrders.id,
                            purchaseOrderId
                        ),
                        eq(
                            purchaseOrders.companyId,
                            employee.companyId
                        )
                    )
                )
                .returning({
                    id: purchaseOrders.id,
                });

        if (!deletedOrder) {
            return errorResponse(
                "Failed to delete purchase order",
                "PURCHASE_ORDER_DELETE_FAILED",
                500
            );
        }

        return successResponse(
            {
                purchaseOrderId:
                    deletedOrder.id,
            },
            "Purchase order deleted successfully",
            200
        );
    } catch (error) {
        console.error(
            "DELETE /api/purchases/purchase-orders/[purchaseOrderId] error:",
            error
        );

        return errorResponse(
            "Failed to delete purchase order",
            "PURCHASE_ORDER_DELETE_FAILED",
            500
        );
    }
}