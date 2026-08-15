import { fail } from "@sveltejs/kit";
import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import {
    createMortgage,
    deleteMortgage,
    getMortgages,
    updateMortgage,
    updateMortgageScenario,
    type MortgageInput,
} from "$lib/server/db/queries";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const user = requireLogin(event);
    const mortgages = await getMortgages(db, user.id);
    return { mortgages };
};

/** Dollars from a form field to integer cents. */
function toCents(value: FormDataEntryValue | null): number | null {
    if (value == null || value === "") return null;
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? Math.round(n * 100) : null;
}

function parseMortgageForm(
    data: FormData,
): { error: ReturnType<typeof fail> } | { data: MortgageInput } {
    const name = (data.get("name") as string)?.trim();
    const startDate = (data.get("startDate") as string)?.trim();
    const originalAmount = toCents(data.get("originalAmount"));
    const piPayment = toCents(data.get("piPayment"));
    const escrowPayment = toCents(data.get("escrowPayment")) ?? 0;
    const termMonths = Number(data.get("termMonths"));
    const rate = Number(data.get("interestRate"));
    const currentBalance = toCents(data.get("currentBalance"));
    const balanceAsOf = (data.get("balanceAsOf") as string)?.trim() || null;

    if (!name) return { error: fail(400, { message: "Name is required" }) };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate ?? ""))
        return {
            error: fail(400, { message: "A valid start date is required" }),
        };
    if (originalAmount == null || originalAmount <= 0)
        return {
            error: fail(400, { message: "Original amount must be positive" }),
        };
    if (!Number.isFinite(rate) || rate < 0 || rate > 100)
        return {
            error: fail(400, { message: "Interest rate must be 0–100%" }),
        };
    if (!Number.isFinite(termMonths) || termMonths < 1 || termMonths > 600)
        return {
            error: fail(400, {
                message: "Term must be between 1 and 600 months",
            }),
        };
    if (piPayment == null || piPayment <= 0)
        return {
            error: fail(400, { message: "Monthly P&I must be positive" }),
        };
    if (currentBalance != null && balanceAsOf == null)
        return {
            error: fail(400, {
                message: "A balance override needs an as-of date",
            }),
        };

    return {
        data: {
            name,
            startDate,
            originalAmount,
            interestRate: Math.round(rate * 1000),
            termMonths: Math.round(termMonths),
            piPayment,
            escrowPayment,
            currentBalance,
            balanceAsOf: currentBalance != null ? balanceAsOf : null,
        },
    };
}

export const actions: Actions = {
    create: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const parsed = parseMortgageForm(data);
        if ("error" in parsed) return parsed.error;

        await createMortgage(db, user.id, parsed.data);
    },

    update: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const id = Number(data.get("id"));
        const parsed = parseMortgageForm(data);
        if ("error" in parsed) return parsed.error;

        await updateMortgage(db, user.id, id, parsed.data);
    },

    delete: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const id = Number(data.get("id"));
        await deleteMortgage(db, user.id, id);
    },

    saveScenario: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();
        const id = Number(data.get("id"));
        const extraPayment = toCents(data.get("extraPayment")) ?? 0;
        await updateMortgageScenario(
            db,
            user.id,
            id,
            Math.max(0, extraPayment),
        );
    },
};
