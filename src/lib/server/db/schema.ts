import {
    sqliteTable,
    text,
    integer,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Auth tables
export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    birthday: text("birthday"),
});

export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// Portfolio tables
export const portfolios = sqliteTable(
    "portfolios",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        userId: text("user_id")
            .notNull()
            .references(() => users.id),
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
    description: text("description"),
    alternatives: text("alternatives", { mode: "json" }).$type<string[]>(),
    sortOrder: integer("sort_order").default(0),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
    portfolios: many(portfolios),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
    user: one(users, {
        fields: [portfolios.userId],
        references: [users.id],
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

// Tax tables
export const taxDocuments = sqliteTable("tax_documents", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    institution: text("institution").notNull(),
    docType: text("doc_type").notNull(),
    taxYear: integer("tax_year").notNull(),
    status: text("status").notNull().default("pending"), // "pending" | "available" | "downloaded"
    portalUrl: text("portal_url"),
    notes: text("notes"),
    updatedAt: integer("updated_at").notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type PortfolioRecord = typeof portfolios.$inferSelect;
export type StockAllocationRecord = typeof stockAllocations.$inferSelect;
export type TaxDocument = typeof taxDocuments.$inferSelect;
