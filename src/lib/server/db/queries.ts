import type { DrizzleDB } from ".";
import { portfolios, stockAllocations, taxDocuments } from "./schema";
import { and, asc, eq } from "drizzle-orm";
import type { Config, Stock } from "$lib/rebalance/types";

export interface Portfolio {
    id: number;
    name: string;
    description: string | null;
    config: Config;
}

export interface PortfolioInput {
    name: string;
    stocks: {
        symbol: string;
        targetPercentage: number;
        alternatives?: string[];
    }[];
}

export async function getPortfoliosFromDb(
    db: DrizzleDB,
    userId: string,
): Promise<Portfolio[]> {
    const portfolioRows = await db
        .select()
        .from(portfolios)
        .where(eq(portfolios.userId, userId))
        .orderBy(asc(portfolios.id));

    const allocationRows = await db
        .select()
        .from(stockAllocations)
        .orderBy(
            asc(stockAllocations.portfolioId),
            asc(stockAllocations.sortOrder),
        );

    // Group allocations by portfolio_id
    const allocationsByPortfolio = new Map<
        number,
        (typeof allocationRows)[number][]
    >();
    for (const row of allocationRows) {
        const existing = allocationsByPortfolio.get(row.portfolioId) ?? [];
        existing.push(row);
        allocationsByPortfolio.set(row.portfolioId, existing);
    }

    // Build portfolios with their configs
    return portfolioRows.map((portfolio) => {
        const allocations = allocationsByPortfolio.get(portfolio.id) ?? [];
        const stocks: Stock[] = allocations.map((a) => ({
            symbol: a.symbol,
            targetPercentage: a.targetPercentage,
            description: a.description,
            alternatives: a.alternatives ?? undefined,
        }));

        return {
            id: portfolio.id,
            name: portfolio.name,
            description: portfolio.description,
            config: { stocks },
        };
    });
}

export async function createPortfolioInDb(
    db: DrizzleDB,
    userId: string,
    data: PortfolioInput,
): Promise<void> {
    const [row] = await db
        .insert(portfolios)
        .values({
            userId,
            name: data.name,
        })
        .returning({ id: portfolios.id });

    if (data.stocks.length > 0) {
        await db.insert(stockAllocations).values(
            data.stocks.map((stock, i) => ({
                portfolioId: row.id,
                symbol: stock.symbol,
                targetPercentage: stock.targetPercentage,
                alternatives: stock.alternatives ?? null,
                description: null,
                sortOrder: i,
            })),
        );
    }
}

export async function updatePortfolioInDb(
    db: DrizzleDB,
    portfolioId: number,
    userId: string,
    data: PortfolioInput,
): Promise<boolean> {
    const updated = await db
        .update(portfolios)
        .set({ name: data.name })
        .where(
            and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)),
        )
        .returning({ id: portfolios.id });

    if (updated.length === 0) return false;

    await db
        .delete(stockAllocations)
        .where(eq(stockAllocations.portfolioId, portfolioId));

    if (data.stocks.length > 0) {
        await db.insert(stockAllocations).values(
            data.stocks.map((stock, i) => ({
                portfolioId,
                symbol: stock.symbol,
                targetPercentage: stock.targetPercentage,
                alternatives: stock.alternatives ?? null,
                description: null,
                sortOrder: i,
            })),
        );
    }

    return true;
}

export async function deletePortfolioInDb(
    db: DrizzleDB,
    portfolioId: number,
    userId: string,
): Promise<boolean> {
    const deleted = await db
        .delete(portfolios)
        .where(
            and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)),
        )
        .returning({ id: portfolios.id });

    return deleted.length > 0;
}

// Tax document queries

const SEED_DOCUMENTS = [
    { institution: "Betterment", docType: "1099", notes: null },
    { institution: "US Bank Mortgage", docType: "1098", notes: null },
    { institution: "Ally Bank", docType: "1099", notes: null },
    {
        institution: "Ally Financial",
        docType: "1099",
        notes: "Separate from Ally Bank",
    },
    { institution: "Fidelity", docType: "1099", notes: null },
    { institution: "8z Rentals", docType: "1099", notes: "Under Documents" },
    {
        institution: "8z Rentals",
        docType: "Year End Cashflow",
        notes: "Under Statements",
    },
    { institution: "Work", docType: "W2", notes: null },
    { institution: "Donations", docType: "Receipts", notes: null },
    {
        institution: "HealthEquity",
        docType: "1099-SA",
        notes: "Only if HSA distributions made",
    },
    { institution: "Work Equity", docType: "83(b) Forms", notes: null },
    {
        institution: "Optum",
        docType: "1099-SA",
        notes: "Only if HSA withdrawals; use UHC login",
    },
    {
        institution: "My Home American",
        docType: "1098",
        notes: "Queen Ct mortgage",
    },
];

export async function getTaxDocuments(
    db: DrizzleDB,
    userId: string,
    taxYear: number,
) {
    return db
        .select()
        .from(taxDocuments)
        .where(
            and(
                eq(taxDocuments.userId, userId),
                eq(taxDocuments.taxYear, taxYear),
            ),
        )
        .orderBy(asc(taxDocuments.id));
}

export async function updateTaxDocumentStatus(
    db: DrizzleDB,
    userId: string,
    id: number,
    status: string,
): Promise<void> {
    await db
        .update(taxDocuments)
        .set({ status, updatedAt: Math.floor(Date.now() / 1000) })
        .where(and(eq(taxDocuments.id, id), eq(taxDocuments.userId, userId)));
}

export async function createTaxDocument(
    db: DrizzleDB,
    userId: string,
    taxYear: number,
    data: {
        institution: string;
        docType: string;
        notes?: string | null;
        portalUrl?: string | null;
    },
): Promise<void> {
    await db.insert(taxDocuments).values({
        userId,
        institution: data.institution,
        docType: data.docType,
        taxYear,
        status: "pending",
        portalUrl: data.portalUrl ?? null,
        notes: data.notes ?? null,
        updatedAt: Math.floor(Date.now() / 1000),
    });
}

export async function updateTaxDocument(
    db: DrizzleDB,
    userId: string,
    id: number,
    data: {
        institution: string;
        docType: string;
        notes?: string | null;
        portalUrl?: string | null;
    },
): Promise<boolean> {
    const updated = await db
        .update(taxDocuments)
        .set({
            institution: data.institution,
            docType: data.docType,
            notes: data.notes ?? null,
            portalUrl: data.portalUrl ?? null,
            updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(and(eq(taxDocuments.id, id), eq(taxDocuments.userId, userId)))
        .returning({ id: taxDocuments.id });

    return updated.length > 0;
}

export async function deleteTaxDocument(
    db: DrizzleDB,
    userId: string,
    id: number,
): Promise<boolean> {
    const deleted = await db
        .delete(taxDocuments)
        .where(and(eq(taxDocuments.id, id), eq(taxDocuments.userId, userId)))
        .returning({ id: taxDocuments.id });

    return deleted.length > 0;
}

export async function seedTaxDocuments(
    db: DrizzleDB,
    userId: string,
    taxYear: number,
): Promise<void> {
    await db.insert(taxDocuments).values(
        SEED_DOCUMENTS.map((doc) => ({
            userId,
            institution: doc.institution,
            docType: doc.docType,
            taxYear,
            status: "pending",
            portalUrl: null,
            notes: doc.notes ?? null,
            updatedAt: Math.floor(Date.now() / 1000),
        })),
    );
}
