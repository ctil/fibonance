import type { Config, RebalanceResult, SymbolData, DepositResult } from "./types";
import { amountToInt } from "./utils";

interface CsvRow {
  Symbol: string;
  "Current Value": string;
}

/**
 * Parse CSV content into rows. Expects headers in first row.
 */
function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split("\n");
  if (lines.length === 0) {
    return [];
  }

  const headerLine = lines[0];
  const headers = headerLine.split(",").map((h) => h.trim());
  const symbolIndex = headers.indexOf("Symbol");
  const valueIndex = headers.indexOf("Current Value");

  if (symbolIndex === -1 || valueIndex === -1) {
    throw new Error("CSV file must have 'Symbol' and 'Current Value' columns");
  }

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = line.split(",").map((f) => f.trim());
    if (fields.length <= symbolIndex || fields.length <= valueIndex) {
      // Skip malformed rows
      continue;
    }

    rows.push({
      Symbol: fields[symbolIndex],
      "Current Value": fields[valueIndex],
    });
  }

  return rows;
}

/**
 * Calculate rebalancing recommendations.
 */
export function rebalanceCalc(
  config: Config,
  csvContent: string,
  depositCents: number = 0
): RebalanceResult {
  // Build a map from any symbol (primary or alternative) to its primary symbol
  const symbolToPrimary = new Map<string, string>();
  for (const stock of config.stocks) {
    symbolToPrimary.set(stock.symbol, stock.symbol);
    for (const alt of stock.alternatives ?? []) {
      symbolToPrimary.set(alt, stock.symbol);
    }
  }

  const rows = parseCsv(csvContent);
  const amountsBySymbol = new Map<string, number>();
  let total = depositCents;

  for (const row of rows) {
    const primarySymbol = symbolToPrimary.get(row.Symbol);
    if (!primarySymbol) {
      // Ignore symbols not in config
      continue;
    }

    const amount = amountToInt(row["Current Value"]);
    total += amount;
    amountsBySymbol.set(
      primarySymbol,
      (amountsBySymbol.get(primarySymbol) ?? 0) + amount
    );
  }

  const symbols: Record<string, SymbolData> = {};

  for (const stock of config.stocks) {
    const currentAmount = amountsBySymbol.get(stock.symbol) ?? 0;
    const currentPercentage = (currentAmount / total) * 100;
    const drift = currentPercentage - stock.target_percentage;
    const amountNeeded = Math.round(total * (-drift / 100)) || 0; // || 0 converts -0 to 0

    symbols[stock.symbol] = {
      amount: currentAmount,
      currentPercentage,
      targetPercentage: stock.target_percentage,
      drift,
      amountNeeded,
    };
  }

  return {
    symbols,
    total,
    depositAmount: depositCents,
  };
}

/**
 * Calculate how to allocate a deposit across assets.
 */
export function depositCalc(config: Config, amountCents: number): DepositResult {
  const allocations: Record<string, number> = {};
  let total = 0;

  for (const stock of config.stocks) {
    const amountToDeposit = Math.floor(
      amountCents * (stock.target_percentage / 100)
    );
    allocations[stock.symbol] = amountToDeposit;
    total += amountToDeposit;
  }

  return {
    allocations,
    total,
  };
}
