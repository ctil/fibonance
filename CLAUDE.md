# Fibonance

Portfolio rebalancing library and web frontend in TypeScript. Includes rebalancing calculations based on target asset allocation percentages, and a SvelteKit frontend for deposit allocation, compound interest calculations, and more.

## Tech Stack

- TypeScript
- Bun
- Svelte / SvelteKit
- Tailwind CSS v4
- Turso (libSQL) with Drizzle ORM
- lucide-svelte for icons

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

### Server (`src/lib/server/`)

- `db/` - Database module (Drizzle ORM)
  - `index.ts` - Drizzle client initialization (requires env vars)
  - `schema.ts` - Drizzle table definitions (source of truth for DB schema)
  - `queries.ts` - Query functions using Drizzle query builder
- `portfolios.ts` - Portfolio service
- `auth.ts` - Session and authentication functions

## Key Conventions

- All amounts stored as **cents** (integers) to avoid float precision issues
- Config `target_percentage` values must sum to exactly 100
- CSV must have `Symbol` and `Current Value` columns
- Positive `amountNeeded` = buy, negative = sell

## Database (Turso with Drizzle ORM)

Portfolio configurations and user authentication are stored in a Turso database using Drizzle ORM. The database is required - set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables.

### Schema

Tables defined in `src/lib/server/db/schema.ts`:

- `user` - User accounts (id, username, password hash)
- `session` - Auth sessions (references user)
- `portfolios` - Portfolio name and description
- `stockAllocations` - Stock symbols, target percentages, and sort order (references portfolio)

### Drizzle Commands

```sh
bun db:generate    # Generate migration
bun db:migrate     # Apply migrations to database
```

### Schema Changes

Edit `src/lib/server/db/schema.ts` then run `bun db:generate` to generate migrations. To apply the migrations, run `bun db:migrate`

## Tests

Tests use JSON definitions in `src/lib/rebalance/tests/definitions/` with fixtures in `tests/configs/` and `tests/portfolios/`. Run with `bun test`.
