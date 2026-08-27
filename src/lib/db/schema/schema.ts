import { timestamp } from "drizzle-orm/pg-core";

export * from "./company-schema";
export * from "./auth-schema";
export * from "./rbac-schema";
export * from "./profile-schema";
export * from "./audit-schema";
export * from "./inventory-schema";
export * from "./purchases-schema";
export * from "./sales-schema";
export * from "./relations";

/* =============================================================================
 * SHARED HELPERS
 * ============================================================================= */

export const timestamps = {
    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
};