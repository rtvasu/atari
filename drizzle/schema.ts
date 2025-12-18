import { pgTable, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const invites = pgTable("invites", {
	email: text().primaryKey().notNull(),
});
