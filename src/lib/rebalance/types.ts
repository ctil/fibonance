// Raw types matching YAML structure (snake_case)
export interface RawStock {
    symbol: string;
    target_percentage: number;
    description: string;
    alternatives?: string[];
}

export interface RawConfig {
    stocks: RawStock[];
}

// Clean TypeScript types (camelCase)
export interface Stock {
    symbol: string;
    targetPercentage: number;
    description: string;
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
