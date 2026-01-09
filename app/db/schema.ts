import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core"

export const invites = pgTable("invites", {
	email: text().primaryKey().notNull(),
});

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	username: text().notNull().unique(),
	phone: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	passwordHash: text("password_hash").notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true }),
	tokenHash: text("token_hash").notNull().unique(),
	replacedByTokenId: uuid("replaced_by_token_id"),
	lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
}, (table) => [
    index("refresh_tokens_user_id_idx").on(table.userId),
    index("refresh_tokens_expires_at_idx").on(table.expiresAt),
]);
