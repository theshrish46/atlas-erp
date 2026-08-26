import {
    pgEnum,
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    numeric,
    integer,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { companies } from "./company-schema";
import { employees } from "./profile-schema";
import { products } from "./inventory-schema";
import { timestamps } from "./schema";

/* =============================================================================
 * ENUMS
 * ============================================================================= */

export const customerTypeEnum = pgEnum("customer_type", [
    "individual",
    "business",
]);

export const quotationStatusEnum = pgEnum("quotation_status", [
    "draft",
    "sent",
    "accepted",
    "rejected",
    "expired",
    "converted",
]);

export const salesOrderStatusEnum = pgEnum("sales_order_status", [
    "draft",
    "confirmed",
    "processing",
    "partially_fulfilled",
    "fulfilled",
    "cancelled",
]);

export const salesInvoiceStatusEnum = pgEnum("sales_invoice_status", [
    "draft",
    "issued",
    "partially_paid",
    "paid",
    "overdue",
    "cancelled",
]);

export const salesPaymentStatusEnum = pgEnum("sales_payment_status", [
    "pending",
    "completed",
    "failed",
    "refunded",
]);

export const salesPaymentMethodEnum = pgEnum("sales_payment_method", [
    "cash",
    "bank_transfer",
    "upi",
    "card",
    "cheque",
    "other",
]);


/* =============================================================================
 * CUSTOMERS
 * ============================================================================= */

export const customers = pgTable(
    "customers",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        customerCode: varchar("customer_code", {
            length: 50,
        }).notNull(),

        type: customerTypeEnum("type")
            .notNull()
            .default("business"),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        email: varchar("email", {
            length: 255,
        }),

        phone: varchar("phone", {
            length: 30,
        }),

        taxNumber: varchar("tax_number", {
            length: 50,
        }),

        address: text("address"),

        city: varchar("city", {
            length: 100,
        }),

        state: varchar("state", {
            length: 100,
        }),

        country: varchar("country", {
            length: 100,
        }),

        postalCode: varchar("postal_code", {
            length: 20,
        }),

        isActive: boolean("is_active")
            .notNull()
            .default(true),

        ...timestamps,
    },
    (table) => ({
        companyCustomerCodeUnique: uniqueIndex(
            "customers_company_code_unique",
        ).on(
            table.companyId,
            table.customerCode,
        ),

        companyNameIdx: index(
            "customers_company_name_idx",
        ).on(
            table.companyId,
            table.name,
        ),

        emailIdx: index(
            "customers_email_idx",
        ).on(table.email),
    }),
);

/* =============================================================================
 * QUOTATIONS
 * ============================================================================= */

export const quotations = pgTable(
    "quotations",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        customerId: uuid("customer_id")
            .notNull()
            .references(() => customers.id, {
                onDelete: "restrict",
            }),

        quotationNumber: varchar("quotation_number", {
            length: 50,
        }).notNull(),

        status: quotationStatusEnum("status")
            .notNull()
            .default("draft"),

        quotationDate: timestamp("quotation_date", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        validUntil: timestamp("valid_until", {
            withTimezone: true,
        }),

        subtotal: numeric("subtotal", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxAmount: numeric("tax_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        discountAmount: numeric("discount_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalAmount: numeric("total_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        notes: text("notes"),

        createdBy: uuid("created_by")
            .notNull()
            .references(() => employees.id, {
                onDelete: "restrict",
            }),

        ...timestamps,
    },
    (table) => ({
        companyQuotationNumberUnique: uniqueIndex(
            "quotations_company_number_unique",
        ).on(
            table.companyId,
            table.quotationNumber,
        ),

        companyStatusIdx: index(
            "quotations_company_status_idx",
        ).on(
            table.companyId,
            table.status,
        ),

        customerIdx: index(
            "quotations_customer_idx",
        ).on(table.customerId),

        quotationDateIdx: index(
            "quotations_date_idx",
        ).on(table.quotationDate),
    }),
);

/* =============================================================================
 * QUOTATION ITEMS
 * ============================================================================= */

export const quotationItems = pgTable(
    "quotation_items",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        quotationId: uuid("quotation_id")
            .notNull()
            .references(() => quotations.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        description: text("description"),

        quantity: numeric("quantity", {
            precision: 15,
            scale: 3,
        })
            .notNull(),

        unitPrice: numeric("unit_price", {
            precision: 15,
            scale: 2,
        })
            .notNull(),

        discountAmount: numeric("discount_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxAmount: numeric("tax_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalAmount: numeric("total_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        ...timestamps,
    },
    (table) => ({
        quotationIdx: index(
            "quotation_items_quotation_idx",
        ).on(table.quotationId),

        productIdx: index(
            "quotation_items_product_idx",
        ).on(table.productId),
    }),
);

/* =============================================================================
 * SALES ORDERS
 * ============================================================================= */

export const salesOrders = pgTable(
    "sales_orders",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        customerId: uuid("customer_id")
            .notNull()
            .references(() => customers.id, {
                onDelete: "restrict",
            }),

        quotationId: uuid("quotation_id")
            .references(() => quotations.id, {
                onDelete: "set null",
            }),

        orderNumber: varchar("order_number", {
            length: 50,
        }).notNull(),

        status: salesOrderStatusEnum("status")
            .notNull()
            .default("draft"),

        orderDate: timestamp("order_date", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        expectedDeliveryDate: timestamp(
            "expected_delivery_date",
            {
                withTimezone: true,
            },
        ),

        subtotal: numeric("subtotal", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxAmount: numeric("tax_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        discountAmount: numeric("discount_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalAmount: numeric("total_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        notes: text("notes"),

        createdBy: uuid("created_by")
            .notNull()
            .references(() => employees.id, {
                onDelete: "restrict",
            }),

        ...timestamps,
    },
    (table) => ({
        companyOrderNumberUnique: uniqueIndex(
            "sales_orders_company_number_unique",
        ).on(
            table.companyId,
            table.orderNumber,
        ),

        companyStatusIdx: index(
            "sales_orders_company_status_idx",
        ).on(
            table.companyId,
            table.status,
        ),

        customerIdx: index(
            "sales_orders_customer_idx",
        ).on(table.customerId),

        quotationIdx: index(
            "sales_orders_quotation_idx",
        ).on(table.quotationId),

        orderDateIdx: index(
            "sales_orders_date_idx",
        ).on(table.orderDate),
    }),
);

/* =============================================================================
 * SALES ORDER ITEMS
 * ============================================================================= */

export const salesOrderItems = pgTable(
    "sales_order_items",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        salesOrderId: uuid("sales_order_id")
            .notNull()
            .references(() => salesOrders.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        description: text("description"),

        quantity: numeric("quantity", {
            precision: 15,
            scale: 3,
        })
            .notNull(),

        unitPrice: numeric("unit_price", {
            precision: 15,
            scale: 2,
        })
            .notNull(),

        discountAmount: numeric("discount_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxAmount: numeric("tax_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalAmount: numeric("total_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        ...timestamps,
    },
    (table) => ({
        salesOrderIdx: index(
            "sales_order_items_order_idx",
        ).on(table.salesOrderId),

        productIdx: index(
            "sales_order_items_product_idx",
        ).on(table.productId),
    }),
);

/* =============================================================================
 * SALES INVOICES
 * ============================================================================= */

export const salesInvoices = pgTable(
    "sales_invoices",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        customerId: uuid("customer_id")
            .notNull()
            .references(() => customers.id, {
                onDelete: "restrict",
            }),

        salesOrderId: uuid("sales_order_id")
            .references(() => salesOrders.id, {
                onDelete: "set null",
            }),

        invoiceNumber: varchar("invoice_number", {
            length: 50,
        }).notNull(),

        status: salesInvoiceStatusEnum("status")
            .notNull()
            .default("draft"),

        invoiceDate: timestamp("invoice_date", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        dueDate: timestamp("due_date", {
            withTimezone: true,
        }),

        subtotal: numeric("subtotal", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxAmount: numeric("tax_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        discountAmount: numeric("discount_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalAmount: numeric("total_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        paidAmount: numeric("paid_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        balanceAmount: numeric("balance_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        notes: text("notes"),

        createdBy: uuid("created_by")
            .notNull()
            .references(() => employees.id, {
                onDelete: "restrict",
            }),

        ...timestamps,
    },
    (table) => ({
        companyInvoiceNumberUnique: uniqueIndex(
            "sales_invoices_company_number_unique",
        ).on(
            table.companyId,
            table.invoiceNumber,
        ),

        companyStatusIdx: index(
            "sales_invoices_company_status_idx",
        ).on(
            table.companyId,
            table.status,
        ),

        customerIdx: index(
            "sales_invoices_customer_idx",
        ).on(table.customerId),

        salesOrderIdx: index(
            "sales_invoices_order_idx",
        ).on(table.salesOrderId),

        invoiceDateIdx: index(
            "sales_invoices_date_idx",
        ).on(table.invoiceDate),

        dueDateIdx: index(
            "sales_invoices_due_date_idx",
        ).on(table.dueDate),
    }),
);

/* =============================================================================
 * SALES INVOICE ITEMS
 * ============================================================================= */

export const salesInvoiceItems = pgTable(
    "sales_invoice_items",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        salesInvoiceId: uuid("sales_invoice_id")
            .notNull()
            .references(() => salesInvoices.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        description: text("description"),

        quantity: numeric("quantity", {
            precision: 15,
            scale: 3,
        })
            .notNull(),

        unitPrice: numeric("unit_price", {
            precision: 15,
            scale: 2,
        })
            .notNull(),

        discountAmount: numeric("discount_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        taxAmount: numeric("tax_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalAmount: numeric("total_amount", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        ...timestamps,
    },
    (table) => ({
        salesInvoiceIdx: index(
            "sales_invoice_items_invoice_idx",
        ).on(table.salesInvoiceId),

        productIdx: index(
            "sales_invoice_items_product_idx",
        ).on(table.productId),
    }),
);

/* =============================================================================
 * SALES PAYMENTS
 * ============================================================================= */

export const salesPayments = pgTable(
    "sales_payments",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        customerId: uuid("customer_id")
            .notNull()
            .references(() => customers.id, {
                onDelete: "restrict",
            }),

        salesInvoiceId: uuid("sales_invoice_id")
            .notNull()
            .references(() => salesInvoices.id, {
                onDelete: "restrict",
            }),

        paymentNumber: varchar("payment_number", {
            length: 50,
        }).notNull(),

        amount: numeric("amount", {
            precision: 15,
            scale: 2,
        })
            .notNull(),

        paymentMethod: salesPaymentMethodEnum(
            "payment_method",
        )
            .notNull()
            .default("bank_transfer"),

        status: salesPaymentStatusEnum("status")
            .notNull()
            .default("pending"),

        paymentDate: timestamp("payment_date", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        referenceNumber: varchar(
            "reference_number",
            {
                length: 100,
            },
        ),

        notes: text("notes"),

        receivedBy: uuid("received_by")
            .notNull()
            .references(() => employees.id, {
                onDelete: "restrict",
            }),

        ...timestamps,
    },
    (table) => ({
        companyPaymentNumberUnique: uniqueIndex(
            "sales_payments_company_number_unique",
        ).on(
            table.companyId,
            table.paymentNumber,
        ),

        companyStatusIdx: index(
            "sales_payments_company_status_idx",
        ).on(
            table.companyId,
            table.status,
        ),

        customerIdx: index(
            "sales_payments_customer_idx",
        ).on(table.customerId),

        invoiceIdx: index(
            "sales_payments_invoice_idx",
        ).on(table.salesInvoiceId),

        paymentDateIdx: index(
            "sales_payments_date_idx",
        ).on(table.paymentDate),
    }),
);