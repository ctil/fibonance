import type { Client } from "@libsql/client";
import type { Config, Stock } from "$lib/rebalance/types";

export interface Portfolio {
    name: string;
    description: string | null;
    config: Config;
}

interface PortfolioRow {
    id: number;
    name: string;
    description: string | null;
}

interface StockAllocationRow {
    portfolio_id: number;
    symbol: string;
    target_percentage: number;
    description: string;
    alternatives: string | null;
    sort_order: number;
}

export async function getPortfoliosFromDb(
    client: Client,
): Promise<Portfolio[]> {
    const portfoliosResult = await client.execute(
        "SELECT id, name, description FROM portfolios ORDER BY id",
    );

    const allocationsResult = await client.execute(
        "SELECT portfolio_id, symbol, target_percentage, description, alternatives, sort_order FROM stock_allocations ORDER BY portfolio_id, sort_order",
    );

    const portfolioRows = portfoliosResult.rows as unknown as PortfolioRow[];
    const allocationRows =
        allocationsResult.rows as unknown as StockAllocationRow[];

    // Group allocations by portfolio_id
    const allocationsByPortfolio = new Map<number, StockAllocationRow[]>();
    for (const row of allocationRows) {
        const existing = allocationsByPortfolio.get(row.portfolio_id) ?? [];
        existing.push(row);
        allocationsByPortfolio.set(row.portfolio_id, existing);
    }

    // Build portfolios with their configs
    return portfolioRows.map((portfolio) => {
        const allocations = allocationsByPortfolio.get(portfolio.id) ?? [];
        const stocks: Stock[] = allocations.map((a) => ({
            symbol: a.symbol,
            targetPercentage: a.target_percentage,
            description: a.description,
            alternatives: a.alternatives ? JSON.parse(a.alternatives) : undefined,
        }));

        return {
            name: portfolio.name,
            description: portfolio.description,
            config: { stocks },
        };
    });
}
