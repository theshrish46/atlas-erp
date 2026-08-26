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
import { employeeDepartments, employeeRoles, employees } from "./profile-schema";
import { users } from "./auth-schema";
import { companies, departments } from "./company-schema";
import { roles } from "./rbac-schema";

/**
 * =============================================================================
 * ENUMS
 * =============================================================================
 */

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

/**
 * =============================================================================
 * COMMON
 * =============================================================================
 */

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



