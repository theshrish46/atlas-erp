import {
    pgEnum,
    pgTable,
    uuid,
    integer,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { companies } from "./company-schema";
import { timestamps } from "./common";

/* =============================================================================
 * ENUMS
 * ============================================================================= */

export const documentCounterTypeEnum = pgEnum(
    "document_counter_type",
    [
        "vendor",
        "purchase_order",
        "goods_received_note",
        "purchase_invoice",
        "purchase_payment",

        "customer",
        "quotation",
        "sales_order",
        "sales_invoice",
        "sales_payment",

        "inventory_adjustment",
    ],
);

/* =============================================================================
 * DOCUMENT COUNTERS
 * ============================================================================= */

export const documentCounters = pgTable(
    "document_counters",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        documentType: documentCounterTypeEnum(
            "document_type",
        ).notNull(),

        currentValue: integer("current_value")
            .notNull()
            .default(0),

        ...timestamps,
    },
    (table) => ({
        companyDocumentUnique: uniqueIndex(
            "document_counters_company_document_unique",
        ).on(
            table.companyId,
            table.documentType,
        ),
    }),
);