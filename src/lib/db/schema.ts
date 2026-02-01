import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const portfolios = sqliteTable("portfolios", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: text("created_at").default("datetime('now')"),
});

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

export const portfoliosRelations = relations(portfolios, ({ many }) => ({
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

export type PortfolioRecord = typeof portfolios.$inferSelect;
export type StockAllocationRecord = typeof stockAllocations.$inferSelect;
