import { getDbClient } from "$lib/db/client";
import { getPortfoliosFromDb, type Portfolio } from "$lib/db/queries";

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

const DEFAULT_CONFIG = {
    stocks: [
        {
            symbol: "VTI",
            targetPercentage: 71,
            description: "Total Market Fund",
        },
        {
            symbol: "VXUS",
            targetPercentage: 18,
            description: "International Fund",
        },
        {
            symbol: "BND",
            targetPercentage: 10,
            description: "Bond Fund",
        },
        {
            symbol: "FBTC",
            targetPercentage: 1,
            description: "Bitcoin ETF",
        },
    ],
};

const INDEXES_ONLY = {
    stocks: [
        {
            symbol: "VTI",
            targetPercentage: 79,
            description: "Total Market Fund",
        },
        {
            symbol: "VXUS",
            targetPercentage: 20,
            description: "International Fund",
        },
        {
            symbol: "FBTC",
            targetPercentage: 1,
            description: "Bitcoin ETF",
        },
    ],
};

const NO_BONDS = {
    stocks: [
        {
            symbol: "VTI",
            targetPercentage: 80,
            description: "Total Market Fund",
        },
        {
            symbol: "VXUS",
            targetPercentage: 20,
            description: "International Fund",
        },
    ],
};

const HARDCODED_PORTFOLIOS: Portfolio[] = [
    { name: "No Bonds", description: null, config: NO_BONDS },
    { name: "Indexes only", description: null, config: INDEXES_ONLY },
    { name: "Full Portfolio", description: null, config: DEFAULT_CONFIG },
];

export type { Portfolio };
