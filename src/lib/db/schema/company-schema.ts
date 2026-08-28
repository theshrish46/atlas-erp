import {
    pgEnum,
    pgTable,
    uuid,
    varchar,
    uniqueIndex,
    text,
    boolean,
    timestamp,
    index
} from "drizzle-orm/pg-core";
import { timestamps } from "./common";

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




export const companies = pgTable(
    "companies",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 100 }).notNull(),

        website: varchar("website", { length: 255 }),
        logoUrl: text("logo_url"),

        gstNumber: varchar("gst_number", { length: 15 }),
        panNumber: varchar("pan_number", { length: 10 }),

        country: varchar("country", { length: 100 }).notNull(),
        state: varchar("state", { length: 100 }).notNull(),
        city: varchar("city", { length: 100 }).notNull(),
        address: text("address"),
        postalCode: varchar("postal_code", { length: 20 }),
        timezone: varchar("timezone", { length: 50 })
            .notNull()
            .default("Asia/Kolkata"),

        subscriptionPlan: subscriptionPlanEnum("subscription_plan")
            .notNull()
            .default("free"),
        subscriptionStatus: subscriptionStatusEnum("subscription_status")
            .notNull()
            .default("trialing"),

        isActive: boolean("is_active").notNull().default(true),

        deletedAt: timestamp("deleted_at", {
            withTimezone: true,
        }),

        ...timestamps,
    },
    (table) => ({
        slugUnique: uniqueIndex("companies_slug_unique").on(table.slug),
        nameIdx: index("companies_name_idx").on(table.name),
    }),
);



export const departments = pgTable(
    "departments",
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

        description: text("description"),

        deletedAt: timestamp("deleted_at", {
            withTimezone: true,
        }),

        ...timestamps,
    },
    (table) => ({
        companyDepartmentUnique: uniqueIndex(
            "departments_company_name_unique"
        ).on(table.companyId, table.name),

        companyIdx: index("departments_company_idx").on(table.companyId),
    }),
);