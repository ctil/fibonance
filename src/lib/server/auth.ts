import { redirect, type RequestEvent } from "@sveltejs/kit";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
        // Single-user app. Accounts are created with `bun run set-password`.
        disableSignUp: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // refresh cookie if visited after 1 day
    },
    user: {
        additionalFields: {
            // Set on the profile page, read by the retirement calculator.
            birthday: { type: "string", required: false, input: false },
        },
    },
    plugins: [sveltekitCookies(getRequestEvent)],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

export function requireLogin(event: RequestEvent): User {
    if (!event.locals.user) {
        const redirectTo = encodeURIComponent(event.url.pathname);
        throw redirect(302, `/login?redirectTo=${redirectTo}`);
    }
    return event.locals.user;
}
