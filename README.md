# Fibonance

## About

Fibonance is a financial planning app that helps with tasks like portfolio rebalancing and retirement planning.
The name is a portmanteau of finance and Fibonacci AKA Fib (the name of a beloved Cavalier King Charles Spaniel).

## Tech Stack

- Bun
- Svelte / SvelteKit
- TailwindCSS
- Typescript

## Development Commands

```sh
bun install

# Start dev server
bun dev

# Production build
bun run build

# Type checking
bun check

# Format code
bun format
```

## Database Migrations

The migrations are generated in `drizzle/`. You can modify them by hand before pushing to prod.

1. Change schema in `src/lib/db/schema.ts`
2. Generate migrations `bun db:generate`
3. Run migrations `bun db:migrate`

