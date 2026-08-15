/**
 * Create the owner account, or reset its email/name/password.
 *
 * Sign-up is disabled in the running app, so this is the only way to create or
 * recover the account. This builds its own Better Auth instance because SvelteKit
 * aliases ($lib, $env) are not available outside the dev/build pipeline — keep the
 * config here in sync with src/lib/server/auth.ts.
 *
 * Usage:
 *   bun run set-password <email> <name> <password>
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/server/db/schema";

const [email, name, password] = Bun.argv.slice(2);

if (!email || !name || !password) {
    console.error("Usage: bun run set-password <email> <name> <password>");
    process.exit(1);
}

if (password.length < 8) {
    console.error("Error: password must be at least 8 characters");
    process.exit(1);
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if ((!url || !authToken) && !url?.startsWith("file:")) {
    console.error(
        "Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are required",
    );
    process.exit(1);
}

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
    console.error("Error: BETTER_AUTH_SECRET environment variable is required");
    process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

// Sign-up is deliberately left enabled here — this script is the escape hatch.
const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    secret,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:5173",
    emailAndPassword: { enabled: true },
});

const ctx = await auth.$context;
const [existing] = await db.select().from(schema.user).limit(1);

if (existing) {
    // Reshape the existing row rather than creating a second user: the id is
    // referenced by portfolios, tax_documents and retirement_scenarios.
    console.log(`Updating existing user ${existing.id}...`);

    await db
        .update(schema.user)
        .set({ email, name, updatedAt: new Date() })
        .where(eq(schema.user.id, existing.id));

    const hashed = await ctx.password.hash(password);
    const [credential] = await db
        .select()
        .from(schema.account)
        .where(eq(schema.account.userId, existing.id));

    if (credential) {
        await db
            .update(schema.account)
            .set({ password: hashed, updatedAt: new Date() })
            .where(eq(schema.account.id, credential.id));
    } else {
        await db.insert(schema.account).values({
            id: crypto.randomUUID(),
            accountId: existing.id,
            providerId: "credential",
            userId: existing.id,
            password: hashed,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Any existing sessions were signed against the old credentials.
    await db
        .delete(schema.session)
        .where(eq(schema.session.userId, existing.id));

    console.log(`Password set for ${email}.`);
} else {
    console.log(`Creating user ${email}...`);

    const result = await auth.api.signUpEmail({
        body: { name, email, password },
    });

    if (!result?.user?.id) {
        console.error("Error: failed to create user", result);
        process.exit(1);
    }

    console.log(`Created user with id ${result.user.id}.`);
}

console.log("Done. Sign in at /login.");
