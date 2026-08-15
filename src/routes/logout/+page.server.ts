import { redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

// There is no page here, only the sign-out action. A plain GET would 500.
export const load: PageServerLoad = async () => {
    return redirect(302, "/");
};

export const actions: Actions = {
    default: async (event) => {
        const sessionData = await auth.api.getSession({
            headers: event.request.headers,
        });

        if (sessionData?.session) {
            await auth.api.revokeSession({
                headers: event.request.headers,
                body: { token: sessionData.session.token },
            });
        }

        return redirect(302, "/login");
    },
};
