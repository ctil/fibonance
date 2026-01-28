import { parse } from "yaml";
import type { Config, RawConfig } from "./types";

export const DEFAULT_CONFIG: Config = {
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

export const INDEXES_ONLY: Config = {
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

export const NO_BONDS: Config = {
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

export function parseConfig(yamlContent: string): Config {
    const raw = parse(yamlContent) as RawConfig;

    const totalPercentage = raw.stocks.reduce(
        (sum, stock) => sum + stock.target_percentage,
        0,
    );

    if (Math.abs(totalPercentage - 100.0) > 1e-9) {
        throw new Error("target percentages do not add up to 100");
    }

    // Validate that no symbol appears multiple times (as primary or alternative)
    const symbolOwner = new Map<string, string>();

    for (const stock of raw.stocks) {
        if (symbolOwner.has(stock.symbol)) {
            const owner = symbolOwner.get(stock.symbol);
            throw new Error(
                `symbol ${stock.symbol} appears multiple times (primary for both ${owner} and ${stock.symbol})`,
            );
        }
        symbolOwner.set(stock.symbol, stock.symbol);

        for (const alt of stock.alternatives ?? []) {
            if (symbolOwner.has(alt)) {
                const owner = symbolOwner.get(alt);
                throw new Error(
                    `symbol ${alt} appears multiple times (primary/alternative for ${owner}, alternative for ${stock.symbol})`,
                );
            }
            symbolOwner.set(alt, stock.symbol);
        }
    }

    // Transform raw types to clean camelCase types
    return {
        stocks: raw.stocks.map((stock) => ({
            symbol: stock.symbol,
            targetPercentage: stock.target_percentage,
            description: stock.description,
            alternatives: stock.alternatives,
        })),
    };
}

export async function parseConfigFile(filePath: string): Promise<Config> {
    const file = Bun.file(filePath);
    const content = await file.text();
    return parseConfig(content);
}
