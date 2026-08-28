import {
    pgTable,
    uuid,
    varchar,
    jsonb,
} from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { companies } from "./company-schema";
import { users } from "./auth-schema";

export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").primaryKey().defaultRandom(),

    companyId: uuid("company_id")
        .references(() => companies.id, {
            onDelete: "cascade",
        }),

    userId: uuid("user_id")
        .references(() => users.id, {
            onDelete: "set null",
        }),

    action: varchar("action", {
        length: 100,
    }).notNull(),

    entityType: varchar("entity_type", {
        length: 100,
    }),

    entityId: uuid("entity_id"),

    metadata: jsonb("metadata"),

    ipAddress: varchar("ip_address", {
        length: 45,
    }),

    ...timestamps,
});