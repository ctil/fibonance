import { parse } from "yaml";
import type { Config } from "./types";

export function parseConfig(yamlContent: string): Config {
  const config = parse(yamlContent) as Config;

  const totalPercentage = config.stocks.reduce(
    (sum, stock) => sum + stock.target_percentage,
    0
  );

  if (Math.abs(totalPercentage - 100.0) > 1e-9) {
    throw new Error("target percentages do not add up to 100");
  }

  // Validate that no symbol appears multiple times (as primary or alternative)
  const symbolOwner = new Map<string, string>();

  for (const stock of config.stocks) {
    if (symbolOwner.has(stock.symbol)) {
      const owner = symbolOwner.get(stock.symbol);
      throw new Error(
        `symbol ${stock.symbol} appears multiple times (primary for both ${owner} and ${stock.symbol})`
      );
    }
    symbolOwner.set(stock.symbol, stock.symbol);

    for (const alt of stock.alternatives ?? []) {
      if (symbolOwner.has(alt)) {
        const owner = symbolOwner.get(alt);
        throw new Error(
          `symbol ${alt} appears multiple times (primary/alternative for ${owner}, alternative for ${stock.symbol})`
        );
      }
      symbolOwner.set(alt, stock.symbol);
    }
  }

  return config;
}

export async function parseConfigFile(filePath: string): Promise<Config> {
  const file = Bun.file(filePath);
  const content = await file.text();
  return parseConfig(content);
}
