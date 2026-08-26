// src/lib/db/schema/relations.ts

import { relations } from "drizzle-orm";

import {
    employeeDepartments,
    employeeRoles,
    employees,
} from "./profile-schema";

import { users } from "./auth-schema";
import { companies, departments } from "./company-schema";
import { roles } from "./rbac-schema";
import { purchaseOrderItems, purchaseOrders, vendors, goodsReceivedNoteItems, goodsReceivedNotes, purchaseInvoiceItems, purchaseInvoices, purchasePayments } from "./purchases-schema";

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