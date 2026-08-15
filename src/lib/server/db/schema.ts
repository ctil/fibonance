import {
    sqliteTable,
    text,
    integer,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Better Auth tables. These are singular, unlike the rest of the schema —
// Better Auth's adapter expects its default model names.
export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    birthday: text("birthday"),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
        mode: "timestamp",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
        mode: "timestamp",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
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
    description: text("description"),
    alternatives: text("alternatives", { mode: "json" }).$type<string[]>(),
    sortOrder: integer("sort_order").default(0),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
    portfolios: many(portfolios),
    retirementScenarios: many(retirementScenarios),
    mortgages: many(mortgages),
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

// Tax tables
export const taxDocuments = sqliteTable("tax_documents", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    institution: text("institution").notNull(),
    docType: text("doc_type").notNull(),
    taxYear: integer("tax_year").notNull(),
    status: text("status").notNull().default("pending"), // "pending" | "available" | "downloaded"
    portalUrl: text("portal_url"),
    notes: text("notes"),
    updatedAt: integer("updated_at").notNull(),
});

// Retirement tables
export const retirementScenarios = sqliteTable("retirement_scenarios", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Default"),
    currentValue: integer("current_value"), // cents
    annualSavings: integer("annual_savings"), // cents
    annualExpenses: integer("annual_expenses"), // cents
    safeWithdrawalRate: integer("safe_withdrawal_rate"), // percentage * 100 (e.g. 400 = 4%)
    expectedRealReturn: integer("expected_real_return"), // percentage * 100
    yearAdjustment: integer("year_adjustment").default(5),
});

export const retirementScenariosRelations = relations(
    retirementScenarios,
    ({ one }) => ({
        user: one(user, {
            fields: [retirementScenarios.userId],
            references: [user.id],
        }),
    }),
);

// Mortgage tables
export const mortgages = sqliteTable("mortgages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startDate: text("start_date").notNull(), // ISO date of the first payment
    originalAmount: integer("original_amount").notNull(), // cents
    interestRate: integer("interest_rate").notNull(), // percentage * 1000 (e.g. 6375 = 6.375%)
    termMonths: integer("term_months").notNull().default(360),
    piPayment: integer("pi_payment").notNull(), // cents, monthly principal + interest
    escrowPayment: integer("escrow_payment").default(0), // cents
    currentBalance: integer("current_balance"), // cents, optional manual override
    balanceAsOf: text("balance_as_of"), // ISO date the override was taken
    extraPayment: integer("extra_payment").default(0), // cents, saved scenario
    sortOrder: integer("sort_order").default(0),
    updatedAt: integer("updated_at").notNull(),
});

export const mortgagesRelations = relations(mortgages, ({ one }) => ({
    user: one(user, {
        fields: [mortgages.userId],
        references: [user.id],
    }),
}));

// Types
export type PortfolioRecord = typeof portfolios.$inferSelect;
export type StockAllocationRecord = typeof stockAllocations.$inferSelect;
export type TaxDocument = typeof taxDocuments.$inferSelect;
export type RetirementScenario = typeof retirementScenarios.$inferSelect;
export type Mortgage = typeof mortgages.$inferSelect;
