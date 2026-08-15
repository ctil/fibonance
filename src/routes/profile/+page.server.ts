import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { requireLogin } from "$lib/server/auth";
import { user } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
    const currentUser = requireLogin(event);
    return {
        birthday: currentUser.birthday,
    };
};

export const actions: Actions = {
    default: async (event) => {
        const currentUser = requireLogin(event);

        const data = await event.request.formData();
        const birthday = data.get("birthday");

        if (typeof birthday !== "string") {
            return fail(400, { message: "Invalid birthday" });
        }

        await db
            .update(user)
            .set({ birthday })
            .where(eq(user.id, currentUser.id));

        return { success: true };
    },
};
