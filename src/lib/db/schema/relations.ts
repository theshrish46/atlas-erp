// src/lib/db/schema/relations.ts

import { relations } from "drizzle-orm";

import {
    employeeDepartments,
    employeeRoles,
    employees,
} from "./profile-schema";

import { users } from "./auth-schema";
import { companies, departments, invitations } from "./company-schema";
import { roles } from "./rbac-schema";
import { purchaseOrderItems, purchaseOrders, vendors, goodsReceivedNoteItems, goodsReceivedNotes, purchaseInvoiceItems, purchaseInvoices, purchasePayments } from "./purchases-schema";
import { productCategories, products, stockAdjustmentLines, stockAdjustments, stockBalances, stockMovementLines, stockMovements, warehouseElements, warehouseLocations, warehouses } from "./inventory-schema";
import { auditLogs } from "./audit-schema";



/* =============================================================================
 * RELATIONS
 * ============================================================================= */

export const employeeRelations = relations(
    employees,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [employees.companyId],
            references: [companies.id],
        }),

        user: one(users, {
            fields: [employees.userId],
            references: [users.id],
        }),

        departments: many(employeeDepartments),

        roles: many(employeeRoles),
    }),
);

export const departmentRelations = relations(
    departments,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [departments.companyId],
            references: [companies.id],
        }),

        employees: many(employeeDepartments),
    }),
);

export const employeeDepartmentRelations = relations(
    employeeDepartments,
    ({ one }) => ({
        employee: one(employees, {
            fields: [employeeDepartments.employeeId],
            references: [employees.id],
        }),

        department: one(departments, {
            fields: [employeeDepartments.departmentId],
            references: [departments.id],
        }),
    }),
);

export const employeeRoleRelations = relations(
    employeeRoles,
    ({ one }) => ({
        employee: one(employees, {
            fields: [employeeRoles.employeeId],
            references: [employees.id],
        }),

        role: one(roles, {
            fields: [employeeRoles.roleId],
            references: [roles.id],
        }),
    }),
);

export const companyRelations = relations(
    companies,
    ({ many }) => ({
        employees: many(employees),
        departments: many(departments),
        roles: many(roles),
        invitations: many(invitations),
        auditLogs: many(auditLogs),
    }),
);

export const userRelations = relations(
    users,
    ({ one, many }) => ({
        employee: one(employees, {
            fields: [users.id],
            references: [employees.userId],
        }),

        sessions: many(sessions),
        invitations: many(invitations),
        passwordResetTokens: many(passwordResetTokens),
        emailVerificationTokens: many(
            emailVerificationTokens,
        ),
        mfaFactors: many(mfaFactors),
        auditLogs: many(auditLogs),
    }),
);


export const employeeRelations = relations(
    employees,
    ({ one, many }) => ({
        user: one(users, {
            fields: [employees.userId],
            references: [users.id],
        }),

        company: one(companies, {
            fields: [employees.companyId],
            references: [companies.id],
        }),

        departments: many(employeeDepartments),
        roles: many(employeeRoles),
    })
);

export const departmentRelations = relations(
    departments,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [departments.companyId],
            references: [companies.id],
        }),

        employees: many(employeeDepartments),
    })
);

export const employeeDepartmentRelations = relations(
    employeeDepartments,
    ({ one }) => ({
        employee: one(employees, {
            fields: [employeeDepartments.employeeId],
            references: [employees.id],
        }),

        department: one(departments, {
            fields: [employeeDepartments.departmentId],
            references: [departments.id],
        }),
    })
);

export const employeeRoleRelations = relations(
    employeeRoles,
    ({ one }) => ({
        employee: one(employees, {
            fields: [employeeRoles.employeeId],
            references: [employees.id],
        }),

        role: one(roles, {
            fields: [employeeRoles.roleId],
            references: [roles.id],
        }),
    })
);


/* =============================================================================
 * PURCHASE ORDER RELATIONS
 * ============================================================================= */

export const purchaseOrderRelations = relations(
    purchaseOrders,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [purchaseOrders.companyId],
            references: [companies.id],
        }),

        vendor: one(vendors, {
            fields: [purchaseOrders.vendorId],
            references: [vendors.id],
        }),

        createdBy: one(employees, {
            fields: [purchaseOrders.createdBy],
            references: [employees.id],
        }),

        warehouse: one(warehouses, {
            fields: [purchaseOrders.warehouseId],
            references: [warehouses.id],
        }),

        items: many(purchaseOrderItems),
    }),
);

export const purchaseOrderItemRelations = relations(
    purchaseOrderItems,
    ({ one }) => ({
        purchaseOrder: one(purchaseOrders, {
            fields: [purchaseOrderItems.purchaseOrderId],
            references: [purchaseOrders.id],
        }),

        product: one(products, {
            fields: [purchaseOrderItems.productId],
            references: [products.id],
        }),
    }),
);



/* =============================================================================
 * RELATIONS
 * ============================================================================= */

/* ---------------------------------------------------------------------------
 * PRODUCT CATEGORY
 * --------------------------------------------------------------------------- */

export const productCategoryRelations = relations(
    productCategories,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [productCategories.companyId],
            references: [companies.id],
        }),

        parent: one(productCategories, {
            fields: [productCategories.parentId],
            references: [productCategories.id],
            relationName: "categoryHierarchy",
        }),

        children: many(productCategories, {
            relationName: "categoryHierarchy",
        }),

        products: many(products),
    }),
);

/* ---------------------------------------------------------------------------
 * PRODUCTS
 * --------------------------------------------------------------------------- */

export const productRelations = relations(
    products,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [products.companyId],
            references: [companies.id],
        }),

        category: one(productCategories, {
            fields: [products.categoryId],
            references: [productCategories.id],
        }),

        stockBalances: many(stockBalances),

        stockMovementLines: many(
            stockMovementLines,
        ),

        stockAdjustmentLines: many(
            stockAdjustmentLines,
        ),
    }),
);

/* ---------------------------------------------------------------------------
 * WAREHOUSES
 * --------------------------------------------------------------------------- */

export const warehouseRelations = relations(
    warehouses,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [warehouses.companyId],
            references: [companies.id],
        }),

        locations: many(warehouseLocations),

        elements: many(warehouseElements),

        stockBalances: many(stockBalances),

        sourceMovements: many(
            stockMovements,
            {
                relationName:
                    "sourceWarehouse",
            },
        ),

        destinationMovements: many(
            stockMovements,
            {
                relationName:
                    "destinationWarehouse",
            },
        ),

        adjustments: many(
            stockAdjustments,
        ),
    }),
);

/* ---------------------------------------------------------------------------
 * WAREHOUSE LOCATIONS
 * --------------------------------------------------------------------------- */

export const warehouseLocationRelations =
    relations(
        warehouseLocations,
        ({ one, many }) => ({
            warehouse: one(warehouses, {
                fields: [
                    warehouseLocations.warehouseId,
                ],
                references: [warehouses.id],
            }),

            parent: one(
                warehouseLocations,
                {
                    fields: [
                        warehouseLocations.parentId,
                    ],
                    references: [
                        warehouseLocations.id,
                    ],
                    relationName:
                        "locationHierarchy",
                },
            ),

            children: many(
                warehouseLocations,
                {
                    relationName:
                        "locationHierarchy",
                },
            ),

            elements: many(
                warehouseElements,
            ),

            stockBalances: many(
                stockBalances,
            ),
        }),
    );

/* ---------------------------------------------------------------------------
 * WAREHOUSE ELEMENTS
 * --------------------------------------------------------------------------- */

export const warehouseElementRelations =
    relations(
        warehouseElements,
        ({ one }) => ({
            warehouse: one(warehouses, {
                fields: [
                    warehouseElements.warehouseId,
                ],
                references: [warehouses.id],
            }),

            location: one(
                warehouseLocations,
                {
                    fields: [
                        warehouseElements.locationId,
                    ],
                    references: [
                        warehouseLocations.id,
                    ],
                },
            ),
        }),
    );

/* ---------------------------------------------------------------------------
 * STOCK BALANCES
 * --------------------------------------------------------------------------- */

export const stockBalanceRelations =
    relations(
        stockBalances,
        ({ one }) => ({
            company: one(companies, {
                fields: [
                    stockBalances.companyId,
                ],
                references: [companies.id],
            }),

            product: one(products, {
                fields: [
                    stockBalances.productId,
                ],
                references: [products.id],
            }),

            warehouse: one(warehouses, {
                fields: [
                    stockBalances.warehouseId,
                ],
                references: [warehouses.id],
            }),

            location: one(
                warehouseLocations,
                {
                    fields: [
                        stockBalances.locationId,
                    ],
                    references: [
                        warehouseLocations.id,
                    ],
                },
            ),
        }),
    );

/* ---------------------------------------------------------------------------
 * STOCK MOVEMENTS
 * --------------------------------------------------------------------------- */

export const stockMovementRelations =
    relations(
        stockMovements,
        ({ one, many }) => ({
            company: one(companies, {
                fields: [
                    stockMovements.companyId,
                ],
                references: [companies.id],
            }),

            sourceWarehouse: one(
                warehouses,
                {
                    fields: [
                        stockMovements.sourceWarehouseId,
                    ],
                    references: [
                        warehouses.id,
                    ],
                    relationName:
                        "sourceWarehouse",
                },
            ),

            destinationWarehouse: one(
                warehouses,
                {
                    fields: [
                        stockMovements.destinationWarehouseId,
                    ],
                    references: [
                        warehouses.id,
                    ],
                    relationName:
                        "destinationWarehouse",
                },
            ),

            creator: one(users, {
                fields: [
                    stockMovements.createdBy,
                ],
                references: [users.id],
            }),

            poster: one(users, {
                fields: [
                    stockMovements.postedBy,
                ],
                references: [users.id],
            }),

            lines: many(
                stockMovementLines,
            ),
        }),
    );

/* ---------------------------------------------------------------------------
 * STOCK MOVEMENT LINES
 * --------------------------------------------------------------------------- */

export const stockMovementLineRelations =
    relations(
        stockMovementLines,
        ({ one }) => ({
            movement: one(
                stockMovements,
                {
                    fields: [
                        stockMovementLines.movementId,
                    ],
                    references: [
                        stockMovements.id,
                    ],
                },
            ),

            product: one(products, {
                fields: [
                    stockMovementLines.productId,
                ],
                references: [products.id],
            }),

            sourceLocation: one(
                warehouseLocations,
                {
                    fields: [
                        stockMovementLines.sourceLocationId,
                    ],
                    references: [
                        warehouseLocations.id,
                    ],
                    relationName:
                        "sourceLocation",
                },
            ),

            destinationLocation: one(
                warehouseLocations,
                {
                    fields: [
                        stockMovementLines.destinationLocationId,
                    ],
                    references: [
                        warehouseLocations.id,
                    ],
                    relationName:
                        "destinationLocation",
                },
            ),
        }),
    );

/* ---------------------------------------------------------------------------
 * STOCK ADJUSTMENTS
 * --------------------------------------------------------------------------- */

export const stockAdjustmentRelations =
    relations(
        stockAdjustments,
        ({ one, many }) => ({
            company: one(companies, {
                fields: [
                    stockAdjustments.companyId,
                ],
                references: [companies.id],
            }),

            warehouse: one(warehouses, {
                fields: [
                    stockAdjustments.warehouseId,
                ],
                references: [warehouses.id],
            }),

            creator: one(users, {
                fields: [
                    stockAdjustments.createdBy,
                ],
                references: [users.id],
            }),

            poster: one(users, {
                fields: [
                    stockAdjustments.postedBy,
                ],
                references: [users.id],
            }),

            lines: many(
                stockAdjustmentLines,
            ),
        }),
    );

/* ---------------------------------------------------------------------------
 * STOCK ADJUSTMENT LINES
 * --------------------------------------------------------------------------- */

export const stockAdjustmentLineRelations =
    relations(
        stockAdjustmentLines,
        ({ one }) => ({
            adjustment: one(
                stockAdjustments,
                {
                    fields: [
                        stockAdjustmentLines.adjustmentId,
                    ],
                    references: [
                        stockAdjustments.id,
                    ],
                },
            ),

            product: one(products, {
                fields: [
                    stockAdjustmentLines.productId,
                ],
                references: [products.id],
            }),

            location: one(
                warehouseLocations,
                {
                    fields: [
                        stockAdjustmentLines.locationId,
                    ],
                    references: [
                        warehouseLocations.id,
                    ],
                },
            ),
        }),
    );