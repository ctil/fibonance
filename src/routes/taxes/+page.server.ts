import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import {
    getTaxDocuments,
    seedTaxDocuments,
    updateTaxDocumentStatus,
} from "$lib/server/db/queries";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const user = requireLogin(event);
    const taxYear = new Date().getFullYear() - 1;
    let docs = await getTaxDocuments(db, user.id, taxYear);
    if (docs.length === 0) {
        await seedTaxDocuments(db, user.id, taxYear);
        docs = await getTaxDocuments(db, user.id, taxYear);
    }
    return { docs, taxYear };
};

export const actions: Actions = {
    updateStatus: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const id = Number(data.get("id"));
        const status = data.get("status") as string;
        await updateTaxDocumentStatus(db, user.id, id, status);
    },
};
