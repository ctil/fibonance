import type { DrizzleDB } from "./client";
import { portfolios, stockAllocations } from "./schema";
import { asc } from "drizzle-orm";
import type { Config, Stock } from "$lib/rebalance/types";

export interface Portfolio {
    name: string;
    description: string | null;
    config: Config;
}

export async function getPortfoliosFromDb(db: DrizzleDB): Promise<Portfolio[]> {
    const portfolioRows = await db
        .select()
        .from(portfolios)
        .orderBy(asc(portfolios.id));

    const allocationRows = await db
        .select()
        .from(stockAllocations)
        .orderBy(asc(stockAllocations.portfolioId), asc(stockAllocations.sortOrder));

    // Group allocations by portfolio_id
    const allocationsByPortfolio = new Map<number, (typeof allocationRows)[number][]>();
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
            name: portfolio.name,
            description: portfolio.description,
            config: { stocks },
        };
    });
}
