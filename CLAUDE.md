# Fibonance

Portfolio rebalancing library and web frontend in TypeScript. Includes rebalancing calculations based on target asset allocation percentages, and a SvelteKit frontend for deposit allocation, compound interest calculations, and more.

## Tech Stack

- TypeScript
- Bun
- Svelte / SvelteKit
- Tailwind CSS v4

## Build and Test

```sh
bun install
bun dev      # Start dev server
bun build    # Production build
bun check    # Type checking
bun test     # Run tests
```

## Code Structure

### Rebalancing Library (`src/lib/rebalance/`)

- `types.ts` - TypeScript interfaces (Config, Stock, SymbolData, RebalanceResult)
- `config.ts` - YAML config parsing with validation
- `rebalance.ts` - Core calculation logic
- `utils.ts` - Dollar string parsing/formatting utilities

### Frontend

- `src/routes/` - SvelteKit pages (`/`, `/deposit`, `/interest`)
- `src/lib/components/` - Svelte components (InputCash, InputPercent, Card, etc.)
- `src/lib/compound.ts` - Compound interest calculation logic

## Key Conventions

- All amounts stored as **cents** (integers) to avoid float precision issues
- Config `target_percentage` values must sum to exactly 100
- CSV must have `Symbol` and `Current Value` columns
- Positive `amountNeeded` = buy, negative = sell

## Tests

Tests use JSON definitions in `src/lib/rebalance/tests/definitions/` with fixtures in `tests/configs/` and `tests/portfolios/`. Run with `bun test`.
