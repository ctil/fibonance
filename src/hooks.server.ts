import type { Handle } from "@sveltejs/kit";
import { building } from "$app/environment";
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

export const handle: Handle = async ({ event, resolve }) => {
    const sessionData = await auth.api.getSession({
        headers: event.request.headers,
    });

    event.locals.user = sessionData?.user ?? null;
    event.locals.session = sessionData?.session ?? null;

    return svelteKitHandler({ event, resolve, auth, building });
};
