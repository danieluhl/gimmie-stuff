import { relations } from "drizzle-orm";
import {
	date,
	integer,
	pgTable,
	serial,
	text,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	clerkId: varchar("clerk_id", { length: 255 }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	sizes: text("sizes"), // Consider JSON or Array if data is complex
	address: text("address"),
	birthday: date("birthday"),
	anniversary: date("anniversary"),
	interests: text("interests"),
});

export const items = pgTable("items", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	description: text("description").notNull(),
	url: text("url"),
});

export const usersRelations = relations(users, ({ many }) => ({
	items: many(items),
}));

export const itemsRelations = relations(items, ({ one }) => ({
	user: one(users, {
		fields: [items.userId],
		references: [users.id],
	}),
}));
