/**
 * =============================================================================
 * ATLAS ERP — AUTH & RBAC SCHEMA
 * =============================================================================
 *
 * Scope: authentication, multi-tenancy (companies), users, roles,
 * permissions, and the junction tables that tie them together.
 *
 * Deliberately NOT included here (future modules — will live in their own
 * files, e.g. `schema.sales.ts`, `schema.inventory.ts`):
 *   - invoices / invoice_lines (sales)
 *   - purchase_orders / po_lines (procurement)
 *   - products / warehouses / stock_ledger (inventory)
 *   - accounts / journal_entries (finance)
 *   - audit_logs
 *
 * Why split by module instead of one giant file? Once you add 10+ modules,
 * a single schema.ts becomes unreviewable in PRs and slows down IDE
 * intellisense. Drizzle doesn't care how many files your schema lives in —
 * you just import and re-export everything from a barrel file (index.ts)
 * and pass that barrel to `drizzle(pool, { schema })`. For now, since you
 * asked for auth only, everything below stays in one file.
 *
 * A NOTE ON FUTURE TRIGGERS (invoice numbering, stock ledger, etc.):
 * Drizzle Kit does not manage Postgres triggers/functions declaratively out
 * of the box. The common pattern is: define the schema here for Drizzle Kit
 * to diff, then hand-write a `.sql` migration (or use `drizzle-kit generate
 * --custom`) for the trigger/function itself, and let Drizzle Kit skip it on
 * subsequent diffs. Keep that in mind when you get to invoice_lines —
 * that's usually where a trigger recalculates the invoice's total.
 *
 * =============================================================================
 */

import { relations, sql } from "drizzle-orm";
import {
    pgTable,
    pgEnum,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    primaryKey,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";

/**
 * -----------------------------------------------------------------------------
 * SHARED HELPERS
 * -----------------------------------------------------------------------------
 * Spreading this into every table keeps createdAt/updatedAt consistent and
 * means a future "add soft-delete to every table" change is a one-line edit
 * here instead of N edits across tables.
 */
const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
};

/**
 * -----------------------------------------------------------------------------
 * ENUMS
 * -----------------------------------------------------------------------------
 * Postgres enums over plain varchar + CHECK because:
 *   1. Drizzle Kit diffs them properly (adding a value is a clean migration).
 *   2. TypeScript gets a literal union type for free — no magic strings.
 * Tradeoff: renaming/removing an enum value is more painful than with a
 * varchar + CHECK. For values that change often (e.g. "designation"), stick
 * with plain varchar — that's why `designation`/`department` below stay text.
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

/**
 * -----------------------------------------------------------------------------
 * 1. COMPANIES — the tenant root
 * -----------------------------------------------------------------------------
 * Every business table you add in the future should carry a companyId FK
 * back to this table. This is the table every row-level security policy
 * (if you add RLS later) will key off of.
 */
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

        country: varchar("country", { length: 100 }),
        state: varchar("state", { length: 100 }),
        city: varchar("city", { length: 100 }),
        address: text("address"),
        postalCode: varchar("postal_code", { length: 20 }),
        timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Kolkata"),

        subscriptionPlan: subscriptionPlanEnum("subscription_plan")
            .notNull()
            .default("free"),
        subscriptionStatus: subscriptionStatusEnum("subscription_status")
            .notNull()
            .default("trialing"),

        isActive: boolean("is_active").notNull().default(true),

        ...timestamps,
    },
    (table) => ({
        slugIdx: uniqueIndex("companies_slug_idx").on(table.slug),
        // Not unique — a company's public email can change without breaking
        // referential integrity, and two group companies might share billing.
        emailIdx: index("companies_email_idx").on(table.email),
    })
);

/**
 * -----------------------------------------------------------------------------
 * 2. USERS
 * -----------------------------------------------------------------------------
 * No `role` column here on purpose — role is derived entirely through
 * user_roles. This is what lets a user hold multiple roles (e.g. someone
 * who is both "Warehouse Manager" and "Purchase Manager") without a schema
 * change.
 */
export const users = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),

        firstName: varchar("first_name", { length: 100 }).notNull(),
        lastName: varchar("last_name", { length: 100 }),

        email: varchar("email", { length: 255 }).notNull(),
        phone: varchar("phone", { length: 20 }),

        // Nullable: users created via invitation don't have a password until
        // they accept and set one. Never store this as NOT NULL with a
        // placeholder — that's a security footgun waiting to happen.
        passwordHash: text("password_hash"),

        profileImage: text("profile_image"),
        designation: varchar("designation", { length: 100 }),
        department: varchar("department", { length: 100 }),
        employeeCode: varchar("employee_code", { length: 50 }),

        emailVerified: boolean("email_verified").notNull().default(false),
        isActive: boolean("is_active").notNull().default(true),
        lastLogin: timestamp("last_login", { withTimezone: true }),

        ...timestamps,
    },
    (table) => ({
        // Global unique per your spec. Worth knowing the alternative for later:
        // uniqueIndex on (companyId, email) instead would let the same person
        // (same email) belong to multiple companies as separate accounts — a
        // common ask in ERPs where consultants work across client companies.
        // Flip this if that need comes up; it's a one-line migration now,
        // a painful one once you have real data.
        emailIdx: uniqueIndex("users_email_idx").on(table.email),
        companyIdx: index("users_company_id_idx").on(table.companyId),
        // Composite + unique: employee codes are scoped to a company, and two
        // companies will absolutely both have an "EMP001".
        employeeCodeIdx: uniqueIndex("users_company_employee_code_idx").on(
            table.companyId,
            table.employeeCode
        ),
    })
);

/**
 * -----------------------------------------------------------------------------
 * 3. ROLES
 * -----------------------------------------------------------------------------
 * Company-scoped, not global. "Admin" in Company A and "Admin" in Company B
 * are different rows — this is what lets each company customize/rename
 * roles later without stepping on each other.
 */
export const roles = pgTable(
    "roles",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),

        name: varchar("name", { length: 100 }).notNull(),
        description: text("description"),

        // System roles (e.g. "Owner") are seeded automatically per company and
        // should be undeletable / unrenameable from the UI. Enforce that in
        // application code — Postgres has no clean way to express "not
        // deletable" declaratively without triggers, and it's not worth one here.
        isSystem: boolean("is_system").notNull().default(false),

        createdAt: timestamps.createdAt,
        updatedAt: timestamps.updatedAt, // added beyond your original spec — cheap now, painful to bolt on later
    },
    (table) => ({
        companyIdx: index("roles_company_id_idx").on(table.companyId),
        // A company shouldn't be able to create two roles named "Admin".
        nameIdx: uniqueIndex("roles_company_name_idx").on(
            table.companyId,
            table.name
        ),
    })
);

/**
 * -----------------------------------------------------------------------------
 * 4. PERMISSIONS
 * -----------------------------------------------------------------------------
 * Global master table — NOT company-scoped. Permissions represent what the
 * *application* can do (`inventory.write`), not what a specific company has
 * configured. You seed this table once via migration/seed script whenever
 * you ship a new module, and every company picks from the same master list.
 */
export const permissions = pgTable(
    "permissions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // e.g. "inventory", "purchase", "sales", "finance", "reports", "users"
        module: varchar("module", { length: 50 }).notNull(),
        // e.g. "read", "write", "delete", "create", "approve", "export", "invite"
        action: varchar("action", { length: 50 }).notNull(),

        description: text("description"),

        createdAt: timestamps.createdAt,
    },
    (table) => ({
        // The functional identity of a permission is (module, action) — this
        // is what you'll query by in code, e.g. checking "inventory.write".
        moduleActionIdx: uniqueIndex("permissions_module_action_idx").on(
            table.module,
            table.action
        ),
        moduleIdx: index("permissions_module_idx").on(table.module),
    })
);

/**
 * -----------------------------------------------------------------------------
 * 5. USER_ROLES — many-to-many junction
 * -----------------------------------------------------------------------------
 */
export const userRoles = pgTable(
    "user_roles",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, { onDelete: "cascade" }),

        // Handy for "who granted this role and when" audit trails later.
        assignedAt: timestamp("assigned_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.roleId] }),
        // Composite PK already gives you an index starting with userId, but a
        // reverse-direction index (role -> users) is worth having for queries
        // like "list everyone with this role".
        roleIdx: index("user_roles_role_id_idx").on(table.roleId),
    })
);

/**
 * -----------------------------------------------------------------------------
 * 6. ROLE_PERMISSIONS — many-to-many junction
 * -----------------------------------------------------------------------------
 */
export const rolePermissions = pgTable(
    "role_permissions",
    {
        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, { onDelete: "cascade" }),
        permissionId: uuid("permission_id")
            .notNull()
            .references(() => permissions.id, { onDelete: "cascade" }),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
        permissionIdx: index("role_permissions_permission_id_idx").on(
            table.permissionId
        ),
    })
);

/**
 * -----------------------------------------------------------------------------
 * 7. REFRESH_TOKENS
 * -----------------------------------------------------------------------------
 * Store a hash of the token, not the raw token, if you can — treat this like
 * a password. I've kept the column named `token` per your spec, but
 * seriously consider hashing before insert (e.g. SHA-256) so a DB leak
 * doesn't hand out live sessions.
 */
export const refreshTokens = pgTable(
    "refresh_tokens",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        token: text("token").notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

        createdAt: timestamps.createdAt,
    },
    (table) => ({
        tokenIdx: uniqueIndex("refresh_tokens_token_idx").on(table.token),
        userIdx: index("refresh_tokens_user_id_idx").on(table.userId),
    })
);

/**
 * -----------------------------------------------------------------------------
 * 8. INVITATIONS
 * -----------------------------------------------------------------------------
 */
export const invitations = pgTable(
    "invitations",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),

        email: varchar("email", { length: 255 }).notNull(),

        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, { onDelete: "cascade" }),

        token: text("token").notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        accepted: boolean("accepted").notNull().default(false),

        createdAt: timestamps.createdAt,
    },
    (table) => ({
        tokenIdx: uniqueIndex("invitations_token_idx").on(table.token),
        companyIdx: index("invitations_company_id_idx").on(table.companyId),
        emailIdx: index("invitations_email_idx").on(table.email),
    })
);

/**
 * =============================================================================
 * RELATIONS
 * =============================================================================
 * These power Drizzle's relational query API — e.g.:
 *
 *   const user = await db.query.users.findFirst({
 *     where: eq(users.id, someId),
 *     with: {
 *       company: true,
 *       userRoles: { with: { role: { with: { rolePermissions: { with: { permission: true } } } } } },
 *     },
 *   });
 *
 * This is what turns "who can this user act as" from a hand-rolled 4-table
 * join into a single readable query. Worth wiring up `permissionsForUser()`
 * as a small helper function in your auth layer once this is live.
 */

export const companiesRelations = relations(companies, ({ many }) => ({
    users: many(users),
    roles: many(roles),
    invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    company: one(companies, {
        fields: [users.companyId],
        references: [companies.id],
    }),
    userRoles: many(userRoles),
    refreshTokens: many(refreshTokens),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
    company: one(companies, {
        fields: [roles.companyId],
        references: [companies.id],
    }),
    userRoles: many(userRoles),
    rolePermissions: many(rolePermissions),
    invitations: many(invitations),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
    rolePermissions: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id],
    }),
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id],
    }),
}));

export const rolePermissionsRelations = relations(
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
    })
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
    company: one(companies, {
        fields: [invitations.companyId],
        references: [companies.id],
    }),
    role: one(roles, {
        fields: [invitations.roleId],
        references: [roles.id],
    }),
}));

/**
 * =============================================================================
 * TYPE EXPORTS
 * =============================================================================
 * Infer these instead of hand-writing interfaces — they stay in sync with
 * the schema automatically. Use `NewX` for insert payloads (respects
 * defaults/optionality) and `X` for select results.
 */
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;