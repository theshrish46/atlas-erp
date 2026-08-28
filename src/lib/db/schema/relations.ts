import { relations } from "drizzle-orm";

import { companies, departments } from "./company-schema";

import {
    users,
    sessions,
    invitations,
    passwordResetTokens,
    emailVerificationTokens,
    mfaFactors,
} from "./auth-schema";

import { roles, permissions, rolePermissions } from "./rbac-schema";

import {
    employees,
    employeeRoles,
    employeeDepartments,
} from "./profile-schema";

import { auditLogs } from "./audit-schema";

import {
    productCategories,
    products,
    warehouses,
    warehouseLocations,
    warehouseElements,
    stockBalances,
    stockMovements,
    stockMovementLines,
    stockAdjustments,
    stockAdjustmentLines,
} from "./inventory-schema";

import {
    vendors,
    purchaseOrders,
    purchaseOrderItems,
    goodsReceivedNotes,
    goodsReceivedNoteItems,
    purchaseInvoices,
    purchaseInvoiceItems,
    purchasePayments,
} from "./purchases-schema";

import {
    customers,
    quotations,
    quotationItems,
    salesOrders,
    salesOrderItems,
    salesInvoices,
    salesInvoiceItems,
    salesPayments,
} from "./sales-schema";

/* =============================================================================
 * COMPANY
 * ============================================================================= */

export const companyRelations = relations(companies, ({ many }) => ({
    employees: many(employees),
    departments: many(departments),
    roles: many(roles),
    invitations: many(invitations),
    auditLogs: many(auditLogs),

    vendors: many(vendors),
    purchaseOrders: many(purchaseOrders),
    goodsReceivedNotes: many(goodsReceivedNotes),
    purchaseInvoices: many(purchaseInvoices),
    purchasePayments: many(purchasePayments),

    productCategories: many(productCategories),
    products: many(products),
    warehouses: many(warehouses),
    stockBalances: many(stockBalances),
    stockMovements: many(stockMovements),
    stockAdjustments: many(stockAdjustments),

    customers: many(customers),
    quotations: many(quotations),
    salesOrders: many(salesOrders),
    salesInvoices: many(salesInvoices),
    salesPayments: many(salesPayments),
}));

export const departmentRelations = relations(departments, ({ one, many }) => ({
    company: one(companies, {
        fields: [departments.companyId],
        references: [companies.id],
    }),

    employees: many(employeeDepartments),
}));

/* =============================================================================
 * AUTH
 * ============================================================================= */

export const userRelations = relations(users, ({ one, many }) => ({
    employee: one(employees, {
        fields: [users.id],
        references: [employees.userId],
    }),

    sessions: many(sessions),
    passwordResetTokens: many(passwordResetTokens),
    emailVerificationTokens: many(emailVerificationTokens),
    mfaFactors: many(mfaFactors),
    auditLogs: many(auditLogs),

    createdStockMovements: many(stockMovements, {
        relationName: "stockMovementCreator",
    }),
    postedStockMovements: many(stockMovements, {
        relationName: "stockMovementPoster",
    }),
    createdStockAdjustments: many(stockAdjustments, {
        relationName: "stockAdjustmentCreator",
    }),
    postedStockAdjustments: many(stockAdjustments, {
        relationName: "stockAdjustmentPoster",
    }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const invitationRelations = relations(invitations, ({ one }) => ({
    company: one(companies, {
        fields: [invitations.companyId],
        references: [companies.id],
    }),

    role: one(roles, {
        fields: [invitations.roleId],
        references: [roles.id],
    }),
}));

export const passwordResetTokenRelations = relations(
    passwordResetTokens,
    ({ one }) => ({
        user: one(users, {
            fields: [passwordResetTokens.userId],
            references: [users.id],
        }),
    }),
);

export const emailVerificationTokenRelations = relations(
    emailVerificationTokens,
    ({ one }) => ({
        user: one(users, {
            fields: [emailVerificationTokens.userId],
            references: [users.id],
        }),
    }),
);

export const mfaFactorRelations = relations(mfaFactors, ({ one }) => ({
    user: one(users, {
        fields: [mfaFactors.userId],
        references: [users.id],
    }),
}));

/* =============================================================================
 * RBAC
 * ============================================================================= */

export const roleRelations = relations(roles, ({ one, many }) => ({
    company: one(companies, {
        fields: [roles.companyId],
        references: [companies.id],
    }),

    rolePermissions: many(rolePermissions),
    employeeRoles: many(employeeRoles),
    invitations: many(invitations),
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
    rolePermissions: many(rolePermissions),
}));

export const rolePermissionRelations = relations(
    rolePermissions,
    ({ one }) => ({
        role: one(roles, {
            fields: [rolePermissions.roleId],
            references: [roles.id],
        }),

        permission: one(permissions, {
            fields: [rolePermissions.permissionId],
            references: [permissions.id],
        }),
    }),
);

/* =============================================================================
 * PROFILE
 * ============================================================================= */

export const employeeRelations = relations(employees, ({ one, many }) => ({
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

    purchaseOrdersCreated: many(purchaseOrders),
    grnsReceived: many(goodsReceivedNotes),
    purchasePaymentsMade: many(purchasePayments),

    quotationsCreated: many(quotations),
    salesOrdersCreated: many(salesOrders),
    salesInvoicesCreated: many(salesInvoices),
    salesPaymentsReceived: many(salesPayments),
}));

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

export const employeeRoleRelations = relations(employeeRoles, ({ one }) => ({
    employee: one(employees, {
        fields: [employeeRoles.employeeId],
        references: [employees.id],
    }),

    role: one(roles, {
        fields: [employeeRoles.roleId],
        references: [roles.id],
    }),
}));

/* =============================================================================
 * AUDIT
 * ============================================================================= */

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
    company: one(companies, {
        fields: [auditLogs.companyId],
        references: [companies.id],
    }),

    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}));

/* =============================================================================
 * INVENTORY
 * ============================================================================= */

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

export const productRelations = relations(products, ({ one, many }) => ({
    company: one(companies, {
        fields: [products.companyId],
        references: [companies.id],
    }),

    category: one(productCategories, {
        fields: [products.categoryId],
        references: [productCategories.id],
    }),

    stockBalances: many(stockBalances),
    stockMovementLines: many(stockMovementLines),
    stockAdjustmentLines: many(stockAdjustmentLines),

    purchaseOrderItems: many(purchaseOrderItems),
    goodsReceivedNoteItems: many(goodsReceivedNoteItems),
    purchaseInvoiceItems: many(purchaseInvoiceItems),

    quotationItems: many(quotationItems),
    salesOrderItems: many(salesOrderItems),
    salesInvoiceItems: many(salesInvoiceItems),
}));

export const warehouseRelations = relations(warehouses, ({ one, many }) => ({
    company: one(companies, {
        fields: [warehouses.companyId],
        references: [companies.id],
    }),

    locations: many(warehouseLocations),
    elements: many(warehouseElements),
    stockBalances: many(stockBalances),

    sourceMovements: many(stockMovements, {
        relationName: "sourceWarehouse",
    }),

    destinationMovements: many(stockMovements, {
        relationName: "destinationWarehouse",
    }),

    adjustments: many(stockAdjustments),
    purchaseOrders: many(purchaseOrders),
}));

export const warehouseLocationRelations = relations(
    warehouseLocations,
    ({ one, many }) => ({
        warehouse: one(warehouses, {
            fields: [warehouseLocations.warehouseId],
            references: [warehouses.id],
        }),

        parent: one(warehouseLocations, {
            fields: [warehouseLocations.parentId],
            references: [warehouseLocations.id],
            relationName: "locationHierarchy",
        }),

        children: many(warehouseLocations, {
            relationName: "locationHierarchy",
        }),

        elements: many(warehouseElements),
        stockBalances: many(stockBalances),
    }),
);

export const warehouseElementRelations = relations(
    warehouseElements,
    ({ one }) => ({
        warehouse: one(warehouses, {
            fields: [warehouseElements.warehouseId],
            references: [warehouses.id],
        }),

        location: one(warehouseLocations, {
            fields: [warehouseElements.locationId],
            references: [warehouseLocations.id],
        }),
    }),
);

export const stockBalanceRelations = relations(stockBalances, ({ one }) => ({
    company: one(companies, {
        fields: [stockBalances.companyId],
        references: [companies.id],
    }),

    product: one(products, {
        fields: [stockBalances.productId],
        references: [products.id],
    }),

    warehouse: one(warehouses, {
        fields: [stockBalances.warehouseId],
        references: [warehouses.id],
    }),

    location: one(warehouseLocations, {
        fields: [stockBalances.locationId],
        references: [warehouseLocations.id],
    }),
}));

export const stockMovementRelations = relations(
    stockMovements,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [stockMovements.companyId],
            references: [companies.id],
        }),

        sourceWarehouse: one(warehouses, {
            fields: [stockMovements.sourceWarehouseId],
            references: [warehouses.id],
            relationName: "sourceWarehouse",
        }),

        destinationWarehouse: one(warehouses, {
            fields: [stockMovements.destinationWarehouseId],
            references: [warehouses.id],
            relationName: "destinationWarehouse",
        }),

        creator: one(users, {
            fields: [stockMovements.createdBy],
            references: [users.id],
            relationName: "stockMovementCreator",
        }),

        poster: one(users, {
            fields: [stockMovements.postedBy],
            references: [users.id],
            relationName: "stockMovementPoster",
        }),

        lines: many(stockMovementLines),
    }),
);

export const stockMovementLineRelations = relations(
    stockMovementLines,
    ({ one }) => ({
        movement: one(stockMovements, {
            fields: [stockMovementLines.movementId],
            references: [stockMovements.id],
        }),

        product: one(products, {
            fields: [stockMovementLines.productId],
            references: [products.id],
        }),

        sourceLocation: one(warehouseLocations, {
            fields: [stockMovementLines.sourceLocationId],
            references: [warehouseLocations.id],
            relationName: "sourceLocation",
        }),

        destinationLocation: one(warehouseLocations, {
            fields: [stockMovementLines.destinationLocationId],
            references: [warehouseLocations.id],
            relationName: "destinationLocation",
        }),
    }),
);

export const stockAdjustmentRelations = relations(
    stockAdjustments,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [stockAdjustments.companyId],
            references: [companies.id],
        }),

        warehouse: one(warehouses, {
            fields: [stockAdjustments.warehouseId],
            references: [warehouses.id],
        }),

        creator: one(users, {
            fields: [stockAdjustments.createdBy],
            references: [users.id],
            relationName: "stockAdjustmentCreator",
        }),

        poster: one(users, {
            fields: [stockAdjustments.postedBy],
            references: [users.id],
            relationName: "stockAdjustmentPoster",
        }),

        lines: many(stockAdjustmentLines),
    }),
);

export const stockAdjustmentLineRelations = relations(
    stockAdjustmentLines,
    ({ one }) => ({
        adjustment: one(stockAdjustments, {
            fields: [stockAdjustmentLines.adjustmentId],
            references: [stockAdjustments.id],
        }),

        product: one(products, {
            fields: [stockAdjustmentLines.productId],
            references: [products.id],
        }),

        location: one(warehouseLocations, {
            fields: [stockAdjustmentLines.locationId],
            references: [warehouseLocations.id],
        }),
    }),
);

/* =============================================================================
 * PURCHASES
 * ============================================================================= */

export const vendorRelations = relations(vendors, ({ one, many }) => ({
    company: one(companies, {
        fields: [vendors.companyId],
        references: [companies.id],
    }),

    purchaseOrders: many(purchaseOrders),
    purchaseInvoices: many(purchaseInvoices),
}));

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
        goodsReceivedNotes: many(goodsReceivedNotes),
        purchaseInvoices: many(purchaseInvoices),
    }),
);

export const purchaseOrderItemRelations = relations(
    purchaseOrderItems,
    ({ one, many }) => ({
        purchaseOrder: one(purchaseOrders, {
            fields: [purchaseOrderItems.purchaseOrderId],
            references: [purchaseOrders.id],
        }),

        product: one(products, {
            fields: [purchaseOrderItems.productId],
            references: [products.id],
        }),

        goodsReceivedNoteItems: many(goodsReceivedNoteItems),
    }),
);

export const goodsReceivedNoteRelations = relations(
    goodsReceivedNotes,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [goodsReceivedNotes.companyId],
            references: [companies.id],
        }),

        purchaseOrder: one(purchaseOrders, {
            fields: [goodsReceivedNotes.purchaseOrderId],
            references: [purchaseOrders.id],
        }),

        receivedBy: one(employees, {
            fields: [goodsReceivedNotes.receivedBy],
            references: [employees.id],
        }),

        items: many(goodsReceivedNoteItems),
        purchaseInvoices: many(purchaseInvoices),
    }),
);

export const goodsReceivedNoteItemRelations = relations(
    goodsReceivedNoteItems,
    ({ one }) => ({
        grn: one(goodsReceivedNotes, {
            fields: [goodsReceivedNoteItems.grnId],
            references: [goodsReceivedNotes.id],
        }),

        purchaseOrderItem: one(purchaseOrderItems, {
            fields: [goodsReceivedNoteItems.purchaseOrderItemId],
            references: [purchaseOrderItems.id],
        }),

        product: one(products, {
            fields: [goodsReceivedNoteItems.productId],
            references: [products.id],
        }),
    }),
);

export const purchaseInvoiceRelations = relations(
    purchaseInvoices,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [purchaseInvoices.companyId],
            references: [companies.id],
        }),

        vendor: one(vendors, {
            fields: [purchaseInvoices.vendorId],
            references: [vendors.id],
        }),

        purchaseOrder: one(purchaseOrders, {
            fields: [purchaseInvoices.purchaseOrderId],
            references: [purchaseOrders.id],
        }),

        grn: one(goodsReceivedNotes, {
            fields: [purchaseInvoices.grnId],
            references: [goodsReceivedNotes.id],
        }),

        items: many(purchaseInvoiceItems),
        payments: many(purchasePayments),
    }),
);

export const purchaseInvoiceItemRelations = relations(
    purchaseInvoiceItems,
    ({ one }) => ({
        invoice: one(purchaseInvoices, {
            fields: [purchaseInvoiceItems.invoiceId],
            references: [purchaseInvoices.id],
        }),

        product: one(products, {
            fields: [purchaseInvoiceItems.productId],
            references: [products.id],
        }),
    }),
);

export const purchasePaymentRelations = relations(
    purchasePayments,
    ({ one }) => ({
        company: one(companies, {
            fields: [purchasePayments.companyId],
            references: [companies.id],
        }),

        invoice: one(purchaseInvoices, {
            fields: [purchasePayments.invoiceId],
            references: [purchaseInvoices.id],
        }),

        paidBy: one(employees, {
            fields: [purchasePayments.paidBy],
            references: [employees.id],
        }),
    }),
);

/* =============================================================================
 * SALES
 * ============================================================================= */

export const customerRelations = relations(customers, ({ one, many }) => ({
    company: one(companies, {
        fields: [customers.companyId],
        references: [companies.id],
    }),

    quotations: many(quotations),
    salesOrders: many(salesOrders),
    salesInvoices: many(salesInvoices),
    salesPayments: many(salesPayments),
}));

export const quotationRelations = relations(
    quotations,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [quotations.companyId],
            references: [companies.id],
        }),

        customer: one(customers, {
            fields: [quotations.customerId],
            references: [customers.id],
        }),

        createdBy: one(employees, {
            fields: [quotations.createdBy],
            references: [employees.id],
        }),

        items: many(quotationItems),
        salesOrders: many(salesOrders),
    }),
);

export const quotationItemRelations = relations(
    quotationItems,
    ({ one }) => ({
        quotation: one(quotations, {
            fields: [quotationItems.quotationId],
            references: [quotations.id],
        }),

        product: one(products, {
            fields: [quotationItems.productId],
            references: [products.id],
        }),
    }),
);

export const salesOrderRelations = relations(
    salesOrders,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [salesOrders.companyId],
            references: [companies.id],
        }),

        customer: one(customers, {
            fields: [salesOrders.customerId],
            references: [customers.id],
        }),

        quotation: one(quotations, {
            fields: [salesOrders.quotationId],
            references: [quotations.id],
        }),

        createdBy: one(employees, {
            fields: [salesOrders.createdBy],
            references: [employees.id],
        }),

        items: many(salesOrderItems),
        salesInvoices: many(salesInvoices),
    }),
);

export const salesOrderItemRelations = relations(
    salesOrderItems,
    ({ one }) => ({
        salesOrder: one(salesOrders, {
            fields: [salesOrderItems.salesOrderId],
            references: [salesOrders.id],
        }),

        product: one(products, {
            fields: [salesOrderItems.productId],
            references: [products.id],
        }),
    }),
);

export const salesInvoiceRelations = relations(
    salesInvoices,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [salesInvoices.companyId],
            references: [companies.id],
        }),

        customer: one(customers, {
            fields: [salesInvoices.customerId],
            references: [customers.id],
        }),

        salesOrder: one(salesOrders, {
            fields: [salesInvoices.salesOrderId],
            references: [salesOrders.id],
        }),

        createdBy: one(employees, {
            fields: [salesInvoices.createdBy],
            references: [employees.id],
        }),

        items: many(salesInvoiceItems),
        payments: many(salesPayments),
    }),
);

export const salesInvoiceItemRelations = relations(
    salesInvoiceItems,
    ({ one }) => ({
        salesInvoice: one(salesInvoices, {
            fields: [salesInvoiceItems.salesInvoiceId],
            references: [salesInvoices.id],
        }),

        product: one(products, {
            fields: [salesInvoiceItems.productId],
            references: [products.id],
        }),
    }),
);

export const salesPaymentRelations = relations(
    salesPayments,
    ({ one }) => ({
        company: one(companies, {
            fields: [salesPayments.companyId],
            references: [companies.id],
        }),

        customer: one(customers, {
            fields: [salesPayments.customerId],
            references: [customers.id],
        }),

        salesInvoice: one(salesInvoices, {
            fields: [salesPayments.salesInvoiceId],
            references: [salesInvoices.id],
        }),

        receivedBy: one(employees, {
            fields: [salesPayments.receivedBy],
            references: [employees.id],
        }),
    }),
);