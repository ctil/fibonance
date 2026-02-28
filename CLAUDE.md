# Fibonance

Financial planning web application with features such as portfolio rebalancing and retirement planning.

## Tech Stack

- TypeScript, Bun, Svelte/SvelteKit, Tailwind CSS v4
- Turso (libSQL) with Drizzle ORM
- lucide-svelte for icons

## Build and Test

```sh
bun install
bun dev        # Start dev server
bun run build  # Production build
bun check      # Type checking
bun test       # Run tests
```

## Key Conventions

- All amounts stored as **cents** (integers) to avoid float precision issues
- CSV must have `Symbol` and `Current Value` columns
- Positive `amountNeeded` = buy, negative = sell
- Database table names are plural
- Use Svelte runes
- Add a class prop to all components
- Fix all compiler warnings and errors
- Colocate components with their pages unless the component is used in multiple places

## Database

Requires `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables.

Schema defined in `src/lib/server/db/schema.ts`. To change schema, edit that file then run `bun db:generate` and `bun db:migrate`.
