import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core"
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
	passwordHash: text().notNull(),
});
