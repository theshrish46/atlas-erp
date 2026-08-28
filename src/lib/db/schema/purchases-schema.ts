import {
    boolean,
    index,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

import { companies } from "./company-schema";
import { employees } from "./profile-schema";
import { products, warehouses } from "./inventory-schema";
import { timestamps } from "./common";

/* =============================================================================
 * ENUMS
 * ============================================================================= */

export const vendorStatusEnum = pgEnum("vendor_status", [
    "active",
    "inactive",
]);

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
    "draft",
    "sent",
    "confirmed",
    "partially_received",
    "received",
    "cancelled",
]);

export const grnStatusEnum = pgEnum("grn_status", [
    "draft",
    "received",
    "inspected",
    "completed",
    "cancelled",
]);

export const purchaseInvoiceStatusEnum = pgEnum(
    "purchase_invoice_status",
    [
        "draft",
        "received",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
    ]
);

export const purchasePaymentMethodEnum = pgEnum(
    "purchase_payment_method",
    [
        "cash",
        "bank_transfer",
        "upi",
        "card",
        "cheque",
        "other",
    ]
);

export const purchasePaymentStatusEnum = pgEnum(
    "purchase_payment_status",
    [
        "pending",
        "completed",
        "failed",
        "cancelled",
    ]
);

/* =============================================================================
 * VENDORS
 * ============================================================================= */

export const vendors = pgTable(
    "vendors",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        vendorCode: varchar("vendor_code", {
            length: 50,
        }).notNull(),

        email: varchar("email", {
            length: 255,
        }),

        phone: varchar("phone", {
            length: 30,
        }),

        website: varchar("website", {
            length: 255,
        }),

        gstNumber: varchar("gst_number", {
            length: 15,
        }),

        panNumber: varchar("pan_number", {
            length: 10,
        }),

        billingAddress: text("billing_address"),

        shippingAddress: text("shipping_address"),

        city: varchar("city", {
            length: 100,
        }),

        state: varchar("state", {
            length: 100,
        }),

        country: varchar("country", {
            length: 100,
        })
            .notNull()
            .default("India"),

        postalCode: varchar("postal_code", {
            length: 20,
        }),

        paymentTerms: varchar("payment_terms", {
            length: 100,
        }),

        notes: text("notes"),

        status: vendorStatusEnum("status")
            .notNull()
            .default("active"),

        isActive: boolean("is_active")
            .notNull()
            .default(true),

        ...timestamps,
    },
    (table) => ({
        companyVendorCodeUnique: uniqueIndex(
            "vendors_company_code_unique"
        ).on(table.companyId, table.vendorCode),

        companyNameIdx: index(
            "vendors_company_name_idx"
        ).on(table.companyId, table.name),

        companyIdx: index(
            "vendors_company_idx"
        ).on(table.companyId),

        gstIdx: index(
            "vendors_gst_idx"
        ).on(table.gstNumber),
    })
);

/* =============================================================================
 * PURCHASE ORDERS
 * ============================================================================= */

export const purchaseOrders = pgTable(
    "purchase_orders",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        vendorId: uuid("vendor_id")
            .notNull()
            .references(() => vendors.id, {
                onDelete: "restrict",
            }),

        createdBy: uuid("created_by")
            .references(() => employees.id, {
                onDelete: "set null",
            }),

        purchaseOrderNumber: varchar("purchase_order_number", {
            length: 50,
        }).notNull(),

        orderDate: timestamp("order_date", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        expectedDeliveryDate: timestamp(
            "expected_delivery_date",
            {
                withTimezone: true,
            }
        ),

        status: purchaseOrderStatusEnum("status")
            .notNull()
            .default("draft"),

        subtotal: numeric("subtotal", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        discountAmount: numeric("discount_amount", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxAmount: numeric("tax_amount", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        shippingAmount: numeric("shipping_amount", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalAmount: numeric("total_amount", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, {
                onDelete: "restrict",
            }),

        notes: text("notes"),

        ...timestamps,
    },
    (table) => ({
        companyPoNumberUnique: uniqueIndex(
            "purchase_orders_company_number_unique"
        ).on(
            table.companyId,
            table.purchaseOrderNumber
        ),

        companyIdx: index(
            "purchase_orders_company_idx"
        ).on(table.companyId),

        vendorIdx: index(
            "purchase_orders_vendor_idx"
        ).on(table.vendorId),

        statusIdx: index(
            "purchase_orders_status_idx"
        ).on(table.status),

        orderDateIdx: index(
            "purchase_orders_order_date_idx"
        ).on(table.orderDate),
    })
);

/* =============================================================================
 * PURCHASE ORDER ITEMS
 * ============================================================================= */

export const purchaseOrderItems = pgTable(
    "purchase_order_items",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        purchaseOrderId: uuid("purchase_order_id")
            .notNull()
            .references(() => purchaseOrders.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        description: text("description"),

        quantity: numeric("quantity", {
            precision: 14,
            scale: 3,
        }).notNull(),

        receivedQuantity: numeric("received_quantity", {
            precision: 14,
            scale: 3,
        })
            .notNull()
            .default("0"),

        unitPrice: numeric("unit_price", {
            precision: 14,
            scale: 2,
        }).notNull(),

        discountPercent: numeric("discount_percent", {
            precision: 5,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxPercent: numeric("tax_percent", {
            precision: 5,
            scale: 2,
        })
            .notNull()
            .default("0"),

        lineTotal: numeric("line_total", {
            precision: 14,
            scale: 2,
        }).notNull(),

        ...timestamps,
    },
    (table) => ({
        purchaseOrderIdx: index(
            "purchase_order_items_order_idx"
        ).on(table.purchaseOrderId),

        productIdx: index(
            "purchase_order_items_product_idx"
        ).on(table.productId),
    })
);

/* =============================================================================
 * GOODS RECEIVED NOTES
 * ============================================================================= */

export const goodsReceivedNotes = pgTable(
    "goods_received_notes",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        purchaseOrderId: uuid("purchase_order_id")
            .notNull()
            .references(() => purchaseOrders.id, {
                onDelete: "restrict",
            }),

        receivedBy: uuid("received_by")
            .references(() => employees.id, {
                onDelete: "set null",
            }),

        grnNumber: varchar("grn_number", {
            length: 50,
        }).notNull(),

        receivedDate: timestamp("received_date", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        status: grnStatusEnum("status")
            .notNull()
            .default("draft"),

        notes: text("notes"),

        ...timestamps,
    },
    (table) => ({
        companyGrnNumberUnique: uniqueIndex(
            "grn_company_number_unique"
        ).on(table.companyId, table.grnNumber),

        companyIdx: index(
            "grn_company_idx"
        ).on(table.companyId),

        purchaseOrderIdx: index(
            "grn_purchase_order_idx"
        ).on(table.purchaseOrderId),

        statusIdx: index(
            "grn_status_idx"
        ).on(table.status),

        receivedDateIdx: index(
            "grn_received_date_idx"
        ).on(table.receivedDate),
    })
);

/* =============================================================================
 * GOODS RECEIVED NOTE ITEMS
 * ============================================================================= */

export const goodsReceivedNoteItems = pgTable(
    "goods_received_note_items",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        grnId: uuid("grn_id")
            .notNull()
            .references(() => goodsReceivedNotes.id, {
                onDelete: "cascade",
            }),

        purchaseOrderItemId: uuid(
            "purchase_order_item_id"
        )
            .notNull()
            .references(() => purchaseOrderItems.id, {
                onDelete: "restrict",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        orderedQuantity: numeric("ordered_quantity", {
            precision: 14,
            scale: 3,
        }).notNull(),

        receivedQuantity: numeric("received_quantity", {
            precision: 14,
            scale: 3,
        }).notNull(),

        rejectedQuantity: numeric("rejected_quantity", {
            precision: 14,
            scale: 3,
        })
            .notNull()
            .default("0"),

        acceptedQuantity: numeric("accepted_quantity", {
            precision: 14,
            scale: 3,
        }).notNull(),

        remarks: text("remarks"),

        ...timestamps,
    },
    (table) => ({
        grnIdx: index(
            "grn_items_grn_idx"
        ).on(table.grnId),

        purchaseOrderItemIdx: index(
            "grn_items_purchase_order_item_idx"
        ).on(table.purchaseOrderItemId),

        productIdx: index(
            "grn_items_product_idx"
        ).on(table.productId),
    })
);

/* =============================================================================
 * PURCHASE INVOICES
 * ============================================================================= */

export const purchaseInvoices = pgTable(
    "purchase_invoices",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        vendorId: uuid("vendor_id")
            .notNull()
            .references(() => vendors.id, {
                onDelete: "restrict",
            }),

        purchaseOrderId: uuid("purchase_order_id")
            .references(() => purchaseOrders.id, {
                onDelete: "set null",
            }),

        grnId: uuid("grn_id")
            .references(() => goodsReceivedNotes.id, {
                onDelete: "set null",
            }),

        invoiceNumber: varchar("invoice_number", {
            length: 100,
        }).notNull(),

        invoiceDate: timestamp("invoice_date", {
            withTimezone: true,
        }).notNull(),

        dueDate: timestamp("due_date", {
            withTimezone: true,
        }),

        status: purchaseInvoiceStatusEnum("status")
            .notNull()
            .default("draft"),

        subtotal: numeric("subtotal", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        discountAmount: numeric("discount_amount", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxAmount: numeric("tax_amount", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalAmount: numeric("total_amount", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        paidAmount: numeric("paid_amount", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        notes: text("notes"),

        ...timestamps,
    },
    (table) => ({
        companyInvoiceNumberUnique: uniqueIndex(
            "purchase_invoices_company_number_unique"
        ).on(
            table.companyId,
            table.invoiceNumber
        ),

        companyIdx: index(
            "purchase_invoices_company_idx"
        ).on(table.companyId),

        vendorIdx: index(
            "purchase_invoices_vendor_idx"
        ).on(table.vendorId),

        purchaseOrderIdx: index(
            "purchase_invoices_purchase_order_idx"
        ).on(table.purchaseOrderId),

        grnIdx: index(
            "purchase_invoices_grn_idx"
        ).on(table.grnId),

        statusIdx: index(
            "purchase_invoices_status_idx"
        ).on(table.status),

        dueDateIdx: index(
            "purchase_invoices_due_date_idx"
        ).on(table.dueDate),
    })
);

/* =============================================================================
 * PURCHASE INVOICE ITEMS
 * ============================================================================= */

export const purchaseInvoiceItems = pgTable(
    "purchase_invoice_items",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        invoiceId: uuid("invoice_id")
            .notNull()
            .references(() => purchaseInvoices.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        description: text("description"),

        quantity: numeric("quantity", {
            precision: 14,
            scale: 3,
        }).notNull(),

        unitPrice: numeric("unit_price", {
            precision: 14,
            scale: 2,
        }).notNull(),

        discountPercent: numeric("discount_percent", {
            precision: 5,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxPercent: numeric("tax_percent", {
            precision: 5,
            scale: 2,
        })
            .notNull()
            .default("0"),

        lineTotal: numeric("line_total", {
            precision: 14,
            scale: 2,
        }).notNull(),

        ...timestamps,
    },
    (table) => ({
        invoiceIdx: index(
            "purchase_invoice_items_invoice_idx"
        ).on(table.invoiceId),

        productIdx: index(
            "purchase_invoice_items_product_idx"
        ).on(table.productId),
    })
);

/* =============================================================================
 * PURCHASE PAYMENTS
 * ============================================================================= */

export const purchasePayments = pgTable(
    "purchase_payments",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        invoiceId: uuid("invoice_id")
            .notNull()
            .references(() => purchaseInvoices.id, {
                onDelete: "restrict",
            }),

        paidBy: uuid("paid_by")
            .references(() => employees.id, {
                onDelete: "set null",
            }),

        paymentNumber: varchar("payment_number", {
            length: 50,
        }).notNull(),

        paymentDate: timestamp("payment_date", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        amount: numeric("amount", {
            precision: 14,
            scale: 2,
        }).notNull(),

        paymentMethod: purchasePaymentMethodEnum(
            "payment_method"
        ).notNull(),

        status: purchasePaymentStatusEnum("status")
            .notNull()
            .default("pending"),

        referenceNumber: varchar(
            "reference_number",
            {
                length: 100,
            }
        ),

        notes: text("notes"),

        ...timestamps,
    },
    (table) => ({
        companyPaymentNumberUnique: uniqueIndex(
            "purchase_payments_company_number_unique"
        ).on(
            table.companyId,
            table.paymentNumber
        ),

        companyIdx: index(
            "purchase_payments_company_idx"
        ).on(table.companyId),

        invoiceIdx: index(
            "purchase_payments_invoice_idx"
        ).on(table.invoiceId),

        paymentDateIdx: index(
            "purchase_payments_date_idx"
        ).on(table.paymentDate),

        statusIdx: index(
            "purchase_payments_status_idx"
        ).on(table.status),
    })
);