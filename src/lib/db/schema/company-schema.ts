import {
    pgEnum,
    pgTable,
    uuid,
    varchar,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "./schema";

/* =============================================================================
 * ENUMS
 * ============================================================================= */

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
    "free",
    "starter",
    "pro",
    "enterprise",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "trialing",
    "active",
    "past_due",
    "canceled",
    "suspended",
]);

export const companySizeEnum = pgEnum("company_size", [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "500+",
]);

/* =============================================================================
 * COMPANIES
 * ============================================================================= */

export const companies = pgTable(
    "companies",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        slug: varchar("company_slug", {
            length: 100,
        }).notNull(),

        ...timestamps,
    },
    (table) => ({
        slugUnique: uniqueIndex("companies_slug_unique").on(table.slug),
    }),
);

/* =============================================================================
 * DEPARTMENTS
 * ============================================================================= */

export const departments = pgTable(
    "department",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        ...timestamps,
    },
    (table) => ({
        companyDepartmentUnique: uniqueIndex(
            "department_company_name_unique",
        ).on(table.companyId, table.name),
    }),
);