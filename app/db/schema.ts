import { pgTable, text, serial, timestamp, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
export const invites = pgTable("invites", {
	email: text().primaryKey().notNull(),
});

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	username: text().notNull().unique(),
	phone: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	passwordHash: text("password_hash").notNull(),
});

export const sessions = pgTable("sessions", {
	id: uuid("id").defaultRandom().primaryKey(),
	userid: serial("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true }),
	sessionTokenHash: text("session_token_hash").notNull(),
});
