export interface Stock {
    symbol: string;
    targetPercentage: number;
    alternatives?: string[];
}

export interface Config {
    stocks: Stock[];
}

export interface SymbolData {
    amount: number;
    amountNeeded: number;
    currentPercentage: number;
    targetPercentage: number;
    drift: number;
}

export interface RebalanceResult {
    symbols: Record<string, SymbolData>;
    total: number;
    depositAmount: number;
}

export interface DepositResult {
    allocations: { symbol: string; amount: number }[];
    total: number;
}
