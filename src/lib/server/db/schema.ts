import {
    sqliteTable,
    text,
    integer,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Auth tables (Lucia)
export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// Portfolio tables
export const portfolios = sqliteTable(
    "portfolios",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        userId: text("user_id")
            .notNull()
            .references(() => user.id),
        name: text("name").notNull(),
        description: text("description"),
        createdAt: text("created_at").default("datetime('now')"),
    },
    (table) => [
        uniqueIndex("portfolios_user_name_idx").on(table.userId, table.name),
    ],
);

export const stockAllocations = sqliteTable("stock_allocations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    portfolioId: integer("portfolio_id")
        .notNull()
        .references(() => portfolios.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    targetPercentage: integer("target_percentage").notNull(),
    description: text("description").notNull(),
    alternatives: text("alternatives", { mode: "json" }).$type<string[]>(),
    sortOrder: integer("sort_order").default(0),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
    portfolios: many(portfolios),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
    user: one(user, {
        fields: [portfolios.userId],
        references: [user.id],
    }),
    stockAllocations: many(stockAllocations),
}));

export const stockAllocationsRelations = relations(
    stockAllocations,
    ({ one }) => ({
        portfolio: one(portfolios, {
            fields: [stockAllocations.portfolioId],
            references: [portfolios.id],
        }),
    }),
);

// Types
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type PortfolioRecord = typeof portfolios.$inferSelect;
export type StockAllocationRecord = typeof stockAllocations.$inferSelect;
