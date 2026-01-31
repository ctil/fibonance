# Fibonance

Portfolio rebalancing library and web frontend in TypeScript. Includes rebalancing calculations based on target asset allocation percentages, and a SvelteKit frontend for deposit allocation, compound interest calculations, and more.

## Tech Stack

- TypeScript
- Bun
- Svelte / SvelteKit
- Tailwind CSS v4
- Turso (libSQL) - optional database for portfolio configs

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

### Database (`src/lib/db/`)

- `client.ts` - Turso client initialization, returns null if env vars not set
- `queries.ts` - Query functions for fetching portfolios with stock allocations
- `schema.sql` - SQL schema and seed data for reference

### Server (`src/lib/server/`)

- `portfolios.ts` - Portfolio service with DB fetch and hardcoded fallback

## Key Conventions

- All amounts stored as **cents** (integers) to avoid float precision issues
- Config `target_percentage` values must sum to exactly 100
- CSV must have `Symbol` and `Current Value` columns
- Positive `amountNeeded` = buy, negative = sell

## Database (Turso)

Portfolio configurations can be stored in a Turso database. The app falls back to hardcoded configs when database env vars are not set.

### Environment Variables

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

### Schema

Two tables with a one-to-many relationship:
- `portfolios` - Portfolio name and description
- `stock_allocations` - Stock symbols, target percentages, and sort order (references portfolio)

See `src/lib/db/schema.sql` for full schema and seed data.

### Fallback Behavior

- No env vars set: uses hardcoded portfolios from `src/lib/rebalance/config.ts`
- DB connection error: logs error, falls back to hardcoded
- Works with zero setup for local development

## Tests

Tests use JSON definitions in `src/lib/rebalance/tests/definitions/` with fixtures in `tests/configs/` and `tests/portfolios/`. Run with `bun test`.
