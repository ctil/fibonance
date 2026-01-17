export interface Stock {
  symbol: string;
  target_percentage: number;
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
  allocations: Record<string, number>;
  total: number;
}
