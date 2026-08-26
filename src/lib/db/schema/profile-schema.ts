import { relations } from "drizzle-orm";
import {
    pgTable,
    pgEnum,
    uuid,
    varchar,
    timestamp,
    uniqueIndex,
    primaryKey,
    text,
    boolean,
    index,
    jsonb
} from "drizzle-orm/pg-core";
import { timestamps } from "./schema";
import { companies, departments } from "./company-schema";
import { users } from "./auth-schema";
import { roles } from "./rbac-schema";




export const employees = pgTable(
    "employees",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        fullName: varchar("first_name", {
            length: 100,
        }).notNull(),

        phone: varchar("phone", {
            length: 20,
        }),

        employeeCode: varchar("employee_code", {
            length: 50,
        }),

        jobTitle: varchar("job_title", {
            length: 150,
        }),

        joinedAt: timestamp("joined_at", {
            withTimezone: true,
        }).defaultNow(),

        deletedAt: timestamp("deleted_at", {
            withTimezone: true,
        }),

        ...timestamps,
    },
    (table) => ({
        userUnique: uniqueIndex("employees_user_unique").on(table.userId),
        companyEmployeeCodeUnique: uniqueIndex(
            "employees_company_code_unique"
        ).on(table.companyId, table.employeeCode),
        companyIdx: index("employees_company_idx").on(table.companyId),
        userIdx: index("employees_user_idx").on(table.userId),
    }),
);


export const employeeRoles = pgTable(
    "employee_roles",
    {
        employeeId: uuid("employee_id")
            .notNull()
            .references(() => employees.id, {
                onDelete: "cascade",
            }),

        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, {
                onDelete: "cascade",
            }),
    },
    (table) => ({
        pk: primaryKey({
            columns: [table.employeeId, table.roleId],
        }),
        employeeIdx: index("employee_roles_employee_idx").on(table.employeeId),
        roleIdx: index("employee_roles_role_idx").on(table.roleId),
    }),
);



export const employeeDepartments = pgTable(
    "employee_departments",
    {
        employeeId: uuid("employee_id")
            .notNull()
            .references(() => employees.id, {
                onDelete: "cascade",
            }),

        departmentId: uuid("department_id")
            .notNull()
            .references(() => departments.id, {
                onDelete: "cascade",
            }),
    },
    (table) => ({
        pk: primaryKey({
            columns: [table.employeeId, table.departmentId],
        }),
        employeeIdx: index("employee_departments_employee_idx").on(
            table.employeeId
        ),
        departmentIdx: index("employee_departments_department_idx").on(
            table.departmentId
        ),
    }),
);
