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
import { subscriptionPlanEnum, subscriptionStatusEnum, timestamps } from "./schema";




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