import { fail } from "@sveltejs/kit";
import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import {
    createTaxDocument,
    deleteTaxDocument,
    getTaxDocuments,
    seedTaxDocuments,
    updateTaxDocument,
    uncheckAllTaxDocuments,
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

function parseTaxDocumentForm(data: FormData) {
    const institution = (data.get("institution") as string)?.trim();
    const docType = (data.get("docType") as string)?.trim();
    const notes = (data.get("notes") as string)?.trim() || null;
    const portalUrl = (data.get("portalUrl") as string)?.trim() || null;

    if (!institution)
        return { error: fail(400, { message: "Institution is required" }) };
    if (!docType)
        return { error: fail(400, { message: "Doc type is required" }) };

    return { data: { institution, docType, notes, portalUrl } };
}

export const actions: Actions = {
    updateStatus: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const id = Number(data.get("id"));
        const status = data.get("status") as string;
        await updateTaxDocumentStatus(db, user.id, id, status);
    },

    create: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const parsed = parseTaxDocumentForm(data);
        if (parsed.error) return parsed.error;

        const taxYear = new Date().getFullYear() - 1;
        await createTaxDocument(db, user.id, taxYear, parsed.data);
    },

    update: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const id = Number(data.get("id"));
        const parsed = parseTaxDocumentForm(data);
        if (parsed.error) return parsed.error;

        await updateTaxDocument(db, user.id, id, parsed.data);
    },

    uncheckAll: async (event) => {
        const user = requireLogin(event);
        const taxYear = new Date().getFullYear() - 1;
        await uncheckAllTaxDocuments(db, user.id, taxYear);
    },

    delete: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const id = Number(data.get("id"));
        await deleteTaxDocument(db, user.id, id);
    },
};
