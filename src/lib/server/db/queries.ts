import type { DrizzleDB } from ".";
import { portfolios, stockAllocations } from "./schema";
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
    stocks: { symbol: string; targetPercentage: number; alternatives?: string[] }[];
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
