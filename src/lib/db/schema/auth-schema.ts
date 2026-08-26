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
import { roles } from "./rbac-schema";



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