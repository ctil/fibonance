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

The migrations are generated in `drizzle/`.

1. Change schema in `src/lib/db/schema.ts`
2. Generate migrations `bun db:generate`
3. Run migrations `bun db:migrate`

## Environment Variables

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:5173
```

See `.env.example`.

For local development, create a DB file:

```sh
 sqlite3 local.db "VACUUM;"
```

And set TURSO_DATABASE_URL to `file:local.db`.

## Authentication

[Better Auth](https://better-auth.com) with email and password. This is a
single-user app, so sign-up is disabled and there is no sign-up page. Create the
account, or reset the password, with:

```sh
bun run set-password <email> <name> <password>
```
