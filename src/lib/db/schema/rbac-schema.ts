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
import { companies } from "./company-schema";




export const roles = pgTable(
    "roles",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        name: varchar("name", {
            length: 100,
        }).notNull(),

        description: text("description"),

        isSystem: boolean("is_system")
            .notNull()
            .default(false),

        deletedAt: timestamp("deleted_at", {
            withTimezone: true,
        }),

        ...timestamps,
    },
    (table) => ({
        companyRoleUnique: uniqueIndex("roles_company_name_unique").on(
            table.companyId,
            table.name,
        ),

        companyIdx: index("roles_company_idx").on(table.companyId),
    }),
);

export const permissions = pgTable(
    "permissions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        key: varchar("key", {
            length: 150,
        }).notNull(),

        description: text("description"),
    },
    (table) => ({
        keyUnique: uniqueIndex("permissions_key_unique").on(table.key),
        keyIdx: index("permissions_key_idx").on(table.key),
    }),
);

export const rolePermissions = pgTable(
    "role_permissions",
    {
        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, {
                onDelete: "cascade",
            }),

        permissionId: uuid("permission_id")
            .notNull()
            .references(() => permissions.id, {
                onDelete: "cascade",
            }),
    },
    (table) => ({
        pk: primaryKey({
            columns: [table.roleId, table.permissionId],
        }),
        roleIdx: index("role_permissions_role_idx").on(table.roleId),
        permissionIdx: index("role_permissions_permission_idx").on(
            table.permissionId,
        ),
    }),
);


