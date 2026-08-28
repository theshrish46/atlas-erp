import {
    boolean,
    index,
    integer,
    jsonb,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { companies } from "./company-schema";
import { timestamps } from "./common";

/* =============================================================================
 * ENUMS
 * ============================================================================= */

export const productStatusEnum = pgEnum("product_status", [
    "active",
    "inactive",
    "discontinued",
]);

export const productTypeEnum = pgEnum("product_type", [
    "stock",
    "service",
    "consumable",
    "asset",
]);

export const warehouseStatusEnum = pgEnum("warehouse_status", [
    "active",
    "inactive",
]);

export const warehouseElementTypeEnum = pgEnum("warehouse_element_type", [
    "rack-single",
    "rack-double",
    "rack-heavy",
    "shelf",
    "pallet-area",
    "cold-storage",
    "wall",
    "column",
    "door",
    "fire-exit",
    "aisle",
    "loading-dock",
    "loading-area",
    "staging-area",
    "inspection-zone",
    "forklift-zone",
    "workstation",
    "packing-station",
    "office",
    "container",
    "bench",
]);

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
    "receipt",
    "issue",
    "transfer",
    "adjustment",
    "return",
    "opening",
]);

export const stockMovementStatusEnum = pgEnum("stock_movement_status", [
    "draft",
    "posted",
    "cancelled",
]);

export const adjustmentTypeEnum = pgEnum("adjustment_type", [
    "increase",
    "decrease",
]);

export const adjustmentStatusEnum = pgEnum("adjustment_status", [
    "draft",
    "posted",
    "cancelled",
]);

/* =============================================================================
 * PRODUCT CATEGORIES
 * ============================================================================= */

export const productCategories = pgTable(
    "product_categories",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        name: varchar("name", {
            length: 150,
        }).notNull(),

        description: text("description"),

        parentId: uuid("parent_id"),

        isActive: boolean("is_active")
            .notNull()
            .default(true),

        ...timestamps,
    },
    (table) => ({
        companyNameUnique: uniqueIndex(
            "product_categories_company_name_unique",
        ).on(table.companyId, table.name),

        companyIdx: index(
            "product_categories_company_idx",
        ).on(table.companyId),

        parentIdx: index(
            "product_categories_parent_idx",
        ).on(table.parentId),
    }),
);

/* =============================================================================
 * PRODUCTS
 * ============================================================================= */

export const products = pgTable(
    "products",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        categoryId: uuid("category_id").references(
            () => productCategories.id,
            {
                onDelete: "set null",
            },
        ),

        sku: varchar("sku", {
            length: 100,
        }).notNull(),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        description: text("description"),

        productType: productTypeEnum("product_type")
            .notNull()
            .default("stock"),

        status: productStatusEnum("status")
            .notNull()
            .default("active"),

        unit: varchar("unit", {
            length: 50,
        })
            .notNull()
            .default("pcs"),

        barcode: varchar("barcode", {
            length: 100,
        }),

        hsnCode: varchar("hsn_code", {
            length: 20,
        }),

        taxRate: numeric("tax_rate", {
            precision: 5,
            scale: 2,
        })
            .notNull()
            .default("0"),

        costPrice: numeric("cost_price", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        sellingPrice: numeric("selling_price", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        minimumStock: numeric("minimum_stock", {
            precision: 15,
            scale: 3,
        })
            .notNull()
            .default("0"),

        maximumStock: numeric("maximum_stock", {
            precision: 15,
            scale: 3,
        }),

        reorderLevel: numeric("reorder_level", {
            precision: 15,
            scale: 3,
        })
            .notNull()
            .default("0"),

        imageUrl: text("image_url"),

        ...timestamps,
    },
    (table) => ({
        companySkuUnique: uniqueIndex(
            "products_company_sku_unique",
        ).on(table.companyId, table.sku),

        companyBarcodeUnique: uniqueIndex(
            "products_company_barcode_unique",
        ).on(table.companyId, table.barcode),

        companyIdx: index(
            "products_company_idx",
        ).on(table.companyId),

        categoryIdx: index(
            "products_category_idx",
        ).on(table.categoryId),

        statusIdx: index(
            "products_status_idx",
        ).on(table.status),

        nameIdx: index(
            "products_name_idx",
        ).on(table.name),
    }),
);

/* =============================================================================
 * WAREHOUSES
 * ============================================================================= */

export const warehouses = pgTable(
    "warehouses",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        code: varchar("code", {
            length: 50,
        }).notNull(),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        description: text("description"),

        address: text("address"),

        country: varchar("country", {
            length: 100,
        }),

        state: varchar("state", {
            length: 100,
        }),

        city: varchar("city", {
            length: 100,
        }),

        postalCode: varchar("postal_code", {
            length: 20,
        }),

        status: warehouseStatusEnum("status")
            .notNull()
            .default("active"),

        isDefault: boolean("is_default")
            .notNull()
            .default(false),

        ...timestamps,
    },
    (table) => ({
        companyCodeUnique: uniqueIndex(
            "warehouses_company_code_unique",
        ).on(table.companyId, table.code),

        companyNameUnique: uniqueIndex(
            "warehouses_company_name_unique",
        ).on(table.companyId, table.name),

        companyIdx: index(
            "warehouses_company_idx",
        ).on(table.companyId),

        statusIdx: index(
            "warehouses_status_idx",
        ).on(table.status),
    }),
);

/* =============================================================================
 * WAREHOUSE LOCATIONS
 *
 * Logical locations inside a warehouse.
 *
 * Example:
 * Warehouse: WH-BLR-01
 *   ├── A01
 *   ├── A02
 *   ├── B01
 *   └── COLD-01
 * ============================================================================= */

export const warehouseLocations = pgTable(
    "warehouse_locations",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, {
                onDelete: "cascade",
            }),

        parentId: uuid("parent_id"),

        code: varchar("code", {
            length: 100,
        }).notNull(),

        name: varchar("name", {
            length: 150,
        }).notNull(),

        description: text("description"),

        isActive: boolean("is_active")
            .notNull()
            .default(true),

        ...timestamps,
    },
    (table) => ({
        warehouseCodeUnique: uniqueIndex(
            "warehouse_locations_warehouse_code_unique",
        ).on(table.warehouseId, table.code),

        warehouseIdx: index(
            "warehouse_locations_warehouse_idx",
        ).on(table.warehouseId),

        parentIdx: index(
            "warehouse_locations_parent_idx",
        ).on(table.parentId),
    }),
);

/* =============================================================================
 * WAREHOUSE CANVAS
 *
 * Stores the actual objects created by the warehouse designer.
 *
 * This is intentionally separate from warehouse_locations because the canvas
 * is a visual layout, while locations represent actual inventory locations.
 * ============================================================================= */

export const warehouseElements = pgTable(
    "warehouse_elements",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, {
                onDelete: "cascade",
            }),

        locationId: uuid("location_id").references(
            () => warehouseLocations.id,
            {
                onDelete: "set null",
            },
        ),

        type: warehouseElementTypeEnum("type")
            .notNull(),

        label: varchar("label", {
            length: 255,
        }),

        x: numeric("x", {
            precision: 15,
            scale: 3,
        })
            .notNull()
            .default("0"),

        y: numeric("y", {
            precision: 15,
            scale: 3,
        })
            .notNull()
            .default("0"),

        width: numeric("width", {
            precision: 15,
            scale: 3,
        })
            .notNull()
            .default("120"),

        height: numeric("height", {
            precision: 15,
            scale: 3,
        })
            .notNull()
            .default("80"),

        rotation: numeric("rotation", {
            precision: 7,
            scale: 2,
        })
            .notNull()
            .default("0"),

        properties: jsonb("properties")
            .$type<Record<string, unknown>>()
            .notNull()
            .default({}),

        zIndex: integer("z_index")
            .notNull()
            .default(0),

        ...timestamps,
    },
    (table) => ({
        warehouseIdx: index(
            "warehouse_elements_warehouse_idx",
        ).on(table.warehouseId),

        locationIdx: index(
            "warehouse_elements_location_idx",
        ).on(table.locationId),

        typeIdx: index(
            "warehouse_elements_type_idx",
        ).on(table.type),
    }),
);

/* =============================================================================
 * STOCK BALANCES
 *
 * Current inventory snapshot.
 *
 * One row represents:
 *
 * Product + Warehouse + Location
 *
 * Example:
 * Product A + Bangalore Warehouse + A01 = 150 units
 * ============================================================================= */

export const stockBalances = pgTable(
    "stock_balances",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, {
                onDelete: "restrict",
            }),

        locationId: uuid("location_id").references(
            () => warehouseLocations.id,
            {
                onDelete: "set null",
            },
        ),

        quantity: numeric("quantity", {
            precision: 18,
            scale: 3,
        })
            .notNull()
            .default("0"),

        reservedQuantity: numeric(
            "reserved_quantity",
            {
                precision: 18,
                scale: 3,
            },
        )
            .notNull()
            .default("0"),

        availableQuantity: numeric(
            "available_quantity",
            {
                precision: 18,
                scale: 3,
            },
        )
            .notNull()
            .default("0"),

        averageCost: numeric("average_cost", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        ...timestamps,
    },
    (table) => ({
        productWarehouseLocationUnique:
            uniqueIndex(
                "stock_balances_product_warehouse_location_unique",
            ).on(
                table.productId,
                table.warehouseId,
                table.locationId,
            ),

        companyIdx: index(
            "stock_balances_company_idx",
        ).on(table.companyId),

        productIdx: index(
            "stock_balances_product_idx",
        ).on(table.productId),

        warehouseIdx: index(
            "stock_balances_warehouse_idx",
        ).on(table.warehouseId),
    }),
);

/* =============================================================================
 * STOCK MOVEMENTS
 *
 * Header table for every inventory transaction.
 *
 * Examples:
 * - Goods received
 * - Stock issued
 * - Warehouse transfer
 * - Return
 * - Opening stock
 * - Adjustment
 * ============================================================================= */

export const stockMovements = pgTable(
    "stock_movements",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        referenceNumber: varchar(
            "reference_number",
            {
                length: 100,
            },
        ).notNull(),

        movementType: stockMovementTypeEnum(
            "movement_type",
        ).notNull(),

        status: stockMovementStatusEnum(
            "status",
        )
            .notNull()
            .default("draft"),

        movementDate: timestamp(
            "movement_date",
            {
                withTimezone: true,
            },
        )
            .notNull()
            .defaultNow(),

        sourceWarehouseId: uuid(
            "source_warehouse_id",
        ).references(() => warehouses.id, {
            onDelete: "set null",
        }),

        destinationWarehouseId: uuid(
            "destination_warehouse_id",
        ).references(() => warehouses.id, {
            onDelete: "set null",
        }),

        reason: text("reason"),

        notes: text("notes"),

        createdBy: uuid("created_by").references(
            () => users.id,
            {
                onDelete: "set null",
            },
        ),

        postedBy: uuid("posted_by").references(
            () => users.id,
            {
                onDelete: "set null",
            },
        ),

        postedAt: timestamp("posted_at", {
            withTimezone: true,
        }),

        ...timestamps,
    },
    (table) => ({
        companyReferenceUnique: uniqueIndex(
            "stock_movements_company_reference_unique",
        ).on(
            table.companyId,
            table.referenceNumber,
        ),

        companyIdx: index(
            "stock_movements_company_idx",
        ).on(table.companyId),

        typeIdx: index(
            "stock_movements_type_idx",
        ).on(table.movementType),

        statusIdx: index(
            "stock_movements_status_idx",
        ).on(table.status),

        dateIdx: index(
            "stock_movements_date_idx",
        ).on(table.movementDate),

        sourceWarehouseIdx: index(
            "stock_movements_source_warehouse_idx",
        ).on(table.sourceWarehouseId),

        destinationWarehouseIdx: index(
            "stock_movements_destination_warehouse_idx",
        ).on(table.destinationWarehouseId),
    }),
);

/* =============================================================================
 * STOCK MOVEMENT LINES
 * ============================================================================= */

export const stockMovementLines = pgTable(
    "stock_movement_lines",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        movementId: uuid("movement_id")
            .notNull()
            .references(() => stockMovements.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        sourceLocationId: uuid(
            "source_location_id",
        ).references(() => warehouseLocations.id, {
            onDelete: "set null",
        }),

        destinationLocationId: uuid(
            "destination_location_id",
        ).references(() => warehouseLocations.id, {
            onDelete: "set null",
        }),

        quantity: numeric("quantity", {
            precision: 18,
            scale: 3,
        }).notNull(),

        unitCost: numeric("unit_cost", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        totalCost: numeric("total_cost", {
            precision: 18,
            scale: 2,
        })
            .notNull()
            .default("0"),

        notes: text("notes"),

        ...timestamps,
    },
    (table) => ({
        movementIdx: index(
            "stock_movement_lines_movement_idx",
        ).on(table.movementId),

        productIdx: index(
            "stock_movement_lines_product_idx",
        ).on(table.productId),

        sourceLocationIdx: index(
            "stock_movement_lines_source_location_idx",
        ).on(table.sourceLocationId),

        destinationLocationIdx: index(
            "stock_movement_lines_destination_location_idx",
        ).on(table.destinationLocationId),
    }),
);

/* =============================================================================
 * STOCK ADJUSTMENTS
 *
 * Business document used by the Adjustment page.
 *
 * Example:
 *
 * ADJ-0001
 * Product: Laptop
 * Warehouse: Bangalore
 * System Qty: 50
 * Actual Qty: 47
 * Difference: -3
 * ============================================================================= */

export const stockAdjustments = pgTable(
    "stock_adjustments",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, {
                onDelete: "restrict",
            }),

        referenceNumber: varchar(
            "reference_number",
            {
                length: 100,
            },
        ).notNull(),

        adjustmentType: adjustmentTypeEnum(
            "adjustment_type",
        ).notNull(),

        status: adjustmentStatusEnum(
            "status",
        )
            .notNull()
            .default("draft"),

        adjustmentDate: timestamp(
            "adjustment_date",
            {
                withTimezone: true,
            },
        )
            .notNull()
            .defaultNow(),

        reason: text("reason"),

        notes: text("notes"),

        createdBy: uuid("created_by").references(
            () => users.id,
            {
                onDelete: "set null",
            },
        ),

        postedBy: uuid("posted_by").references(
            () => users.id,
            {
                onDelete: "set null",
            },
        ),

        postedAt: timestamp("posted_at", {
            withTimezone: true,
        }),

        ...timestamps,
    },
    (table) => ({
        companyReferenceUnique: uniqueIndex(
            "stock_adjustments_company_reference_unique",
        ).on(
            table.companyId,
            table.referenceNumber,
        ),

        companyIdx: index(
            "stock_adjustments_company_idx",
        ).on(table.companyId),

        warehouseIdx: index(
            "stock_adjustments_warehouse_idx",
        ).on(table.warehouseId),

        statusIdx: index(
            "stock_adjustments_status_idx",
        ).on(table.status),

        dateIdx: index(
            "stock_adjustments_date_idx",
        ).on(table.adjustmentDate),
    }),
);

/* =============================================================================
 * STOCK ADJUSTMENT LINES
 * ============================================================================= */

export const stockAdjustmentLines = pgTable(
    "stock_adjustment_lines",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        adjustmentId: uuid("adjustment_id")
            .notNull()
            .references(() => stockAdjustments.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "restrict",
            }),

        locationId: uuid("location_id").references(
            () => warehouseLocations.id,
            {
                onDelete: "set null",
            },
        ),

        systemQuantity: numeric(
            "system_quantity",
            {
                precision: 18,
                scale: 3,
            },
        )
            .notNull()
            .default("0"),

        actualQuantity: numeric(
            "actual_quantity",
            {
                precision: 18,
                scale: 3,
            },
        ).notNull(),

        differenceQuantity: numeric(
            "difference_quantity",
            {
                precision: 18,
                scale: 3,
            },
        ).notNull(),

        unitCost: numeric("unit_cost", {
            precision: 15,
            scale: 2,
        })
            .notNull()
            .default("0"),

        adjustmentValue: numeric(
            "adjustment_value",
            {
                precision: 18,
                scale: 2,
            },
        )
            .notNull()
            .default("0"),

        reason: text("reason"),

        ...timestamps,
    },
    (table) => ({
        adjustmentIdx: index(
            "stock_adjustment_lines_adjustment_idx",
        ).on(table.adjustmentId),

        productIdx: index(
            "stock_adjustment_lines_product_idx",
        ).on(table.productId),

        locationIdx: index(
            "stock_adjustment_lines_location_idx",
        ).on(table.locationId),
    }),
);