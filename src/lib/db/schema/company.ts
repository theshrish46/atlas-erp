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


export const department = pgTable(
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



export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),

    email: varchar("email", { length: 255 })
        .notNull()
        .unique(),

    passwordHash: varchar("password_hash", {
        length: 255,
    }),

    emailVerifiedAt: timestamp("email_verified_at", {
        withTimezone: true,
    }),

    isActive: boolean("is_active")
        .notNull()
        .default(true),

    ...timestamps,
});


export const sessions = pgTable(
    "sessions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        tokenHash: varchar("token_hash", {
            length: 255,
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
);

export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", {
        length: 100,
    }).notNull(),

    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, {
            onDelete: "cascade",
        }),


    ...timestamps,
},
    (table) => ({
        companyNameUnique: uniqueIndex("roles_company_name_unique").on(table.companyId, table.name),
    }),
);

export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey().defaultRandom(),

    key: varchar("key", {
        length: 150,
    }).notNull().unique(),

    description: text("description"),
});

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
            columns: [
                table.roleId,
                table.permissionId,
            ],
        }),
    }),
);

export const invitations = pgTable("invitations", {
    id: uuid("id").primaryKey().defaultRandom(),

    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),

    roleId: uuid("role_id")
        .references(() => roles.id, { onDelete: "set null" }),

    email: varchar("email", { length: 255 }).notNull(),

    tokenHash: varchar("token_hash", { length: 255 }).notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    acceptedAt: timestamp("accepted_at", { withTimezone: true }),

    ...timestamps,
});

export const passwordResetTokens = pgTable(
    "password_reset_tokens",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        tokenHash: varchar("token_hash", {
            length: 255,
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

        tokenHash: varchar("token_hash", {
            length: 255,
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

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),


});



export const employeeRoles = pgTable(
    "employee_roles",
    {
        employeeId: uuid("employee_id")
            .notNull()
            .references(() => employee.id, {
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
            columns: [
                table.employeeId,
                table.roleId,
            ],
        }),
    }),
);




export const employee = pgTable("employee", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .notNull()
        .unique()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    name: varchar("name", {
        length: 255,
    }).notNull(),

    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, {
            onDelete: "cascade",
        }),

    ...timestamps,
});

export const employeeDepartment = pgTable(
    "employee_department",
    {
        employeeId: uuid("employee_id")
            .notNull()
            .references(() => employee.id, {
                onDelete: "cascade",
            }),

        departmentId: uuid("department_id")
            .notNull()
            .references(() => department.id, {
                onDelete: "cascade",
            }),
    },
    (table) => ({
        pk: primaryKey({
            columns: [table.employeeId, table.departmentId],
        }),
    }),
);


export const employeeRelations = relations(
    employee,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [employee.companyId],
            references: [companies.id],
        }),

        departments: many(employeeDepartment),
    }),
);

export const departmentRelations = relations(
    department,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [department.companyId],
            references: [companies.id],
        }),

        employees: many(employeeDepartment),
    }),
);

export const employeeDepartmentRelations = relations(
    employeeDepartment,
    ({ one }) => ({
        employee: one(employee, {
            fields: [employeeDepartment.employeeId],
            references: [employee.id],
        }),

        department: one(department, {
            fields: [employeeDepartment.departmentId],
            references: [department.id],
        }),
    }),
);



