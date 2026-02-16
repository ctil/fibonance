import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, "/login");
    }
    return {
        birthday: locals.user.birthday,
    };
};

export const actions: Actions = {
    default: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: "Unauthorized" });
        }

        const data = await request.formData();
        const birthday = data.get("birthday");

        if (typeof birthday !== "string") {
            return fail(400, { message: "Invalid birthday" });
        }

        await db
            .update(users)
            .set({ birthday })
            .where(eq(users.id, locals.user.id));

        return { success: true };
    },
};
