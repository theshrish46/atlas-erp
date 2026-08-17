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

const timestamps = {
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

/**
 * =============================================================================
 * COMPANIES
 * =============================================================================
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













export const users = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        email: varchar("email", { length: 255 }).notNull(),
        passwordHash: varchar("password_hash", {
            length: 255,
        }),
        emailVerifiedAt: timestamp("email_verified_at", {
            withTimezone: true,
        }),
        isActive: boolean("is_active")
            .notNull()
            .default(true),
        deletedAt: timestamp("deleted_at", {
            withTimezone: true,
        }),

        ...timestamps,
    },
    (table) => ({
        emailUnique: uniqueIndex("users_email_unique").on(table.email),
        emailIdx: index("users_email_idx").on(table.email),
    }),
);

export const sessions = pgTable(
    "sessions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        tokenHash: text("token_hash", {
        }).notNull(),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }).notNull(),

        revokedAt: timestamp("revoked_at", {
            withTimezone: true,
        }),

        ipAddress: varchar("ip_address", {
            length: 45,
        }),

        userAgent: text("user_agent"),

        ...timestamps,
    },
    (table) => ({
        userIdx: index("sessions_user_idx").on(table.userId),
        tokenIdx: index("sessions_token_idx").on(table.tokenHash),
        expiresIdx: index("sessions_expires_idx").on(table.expiresAt),
    }),
);

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

export const invitations = pgTable(
    "invitations",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        companyId: uuid("company_id")
            .notNull()
            .references(() => companies.id, {
                onDelete: "cascade",
            }),

        roleId: uuid("role_id").references(() => roles.id, {
            onDelete: "set null",
        }),

        email: varchar("email", {
            length: 255,
        }).notNull(),

        tokenHash: text("token_hash", {
        }).notNull(),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }).notNull(),

        acceptedAt: timestamp("accepted_at", {
            withTimezone: true,
        }),

        deletedAt: timestamp("deleted_at", {
            withTimezone: true,
        }),

        ...timestamps,
    },
    (table) => ({
        companyIdx: index("invitations_company_idx").on(table.companyId),
        emailIdx: index("invitations_email_idx").on(table.email),
        tokenIdx: index("invitations_token_idx").on(table.tokenHash),
    }),
);


export const passwordResetTokens = pgTable(
    "password_reset_tokens",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        tokenHash: text("token_hash", {
        }).notNull(),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }).notNull(),

        usedAt: timestamp("used_at", {
            withTimezone: true,
        }),
    },
);

export const emailVerificationTokens = pgTable(
    "email_verification_tokens",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        tokenHash: text("token_hash", {
        }).notNull(),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }).notNull(),

        verifiedAt: timestamp("verified_at", {
            withTimezone: true,
        }),
    },
);

export const mfaFactors = pgTable("mfa_factors", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    type: varchar("type", {
        length: 50,
    }).notNull(),

    secretEncrypted: text("secret_encrypted"),

    enabledAt: timestamp("enabled_at", {
        withTimezone: true,
    }),

    ...timestamps,
});

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

/* =============================================================================
 * RELATIONS
 * ============================================================================= */

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