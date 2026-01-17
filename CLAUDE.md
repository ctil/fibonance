# Fibonance

Portfolio rebalancing library in TypeScript. Calculates rebalancing recommendations based on target asset allocation percentages and current holdings.

## Build and Test

```sh
bun install
bun test
```

## Usage

```typescript
import { parseConfig, rebalanceCalc } from "./src";

const config = parseConfig(yamlContent);
const result = rebalanceCalc(config, csvContent, depositCents);
// result.symbols[symbol].amountNeeded -> cents to buy (positive) or sell (negative)
```

## Code Structure

- `src/types.ts` - TypeScript interfaces (Config, Stock, SymbolData, RebalanceResult)
- `src/config.ts` - YAML config parsing with validation
- `src/rebalance.ts` - Core calculation logic (rebalanceCalc, depositCalc)
- `src/utils.ts` - Dollar string parsing/formatting utilities

## Key Conventions

- All amounts stored as **cents** (integers) to avoid float precision issues
- Config `target_percentage` values must sum to exactly 100
- CSV must have `Symbol` and `Current Value` columns
- Positive `amountNeeded` = buy, negative = sell

## Tests

Tests use JSON definitions in `tests/definitions/` with fixtures in `tests/configs/` and `tests/portfolios/`. Run with `bun test`.
