import { getDbClient } from "$lib/db/client";
import { getPortfoliosFromDb, type Portfolio } from "$lib/db/queries";
import { DEFAULT_CONFIG, INDEXES_ONLY, NO_BONDS } from "$lib/rebalance";

const HARDCODED_PORTFOLIOS: Portfolio[] = [
    { name: "No Bonds", description: null, config: NO_BONDS },
    { name: "Indexes only", description: null, config: INDEXES_ONLY },
    { name: "Full Portfolio", description: null, config: DEFAULT_CONFIG },
];

export async function getPortfolios(): Promise<Portfolio[]> {
    const client = getDbClient();

    if (!client) {
        return HARDCODED_PORTFOLIOS;
    }

    try {
        return await getPortfoliosFromDb(client);
    } catch (error) {
        console.error("Failed to fetch portfolios from database:", error);
        return HARDCODED_PORTFOLIOS;
    }
}

export type { Portfolio };
