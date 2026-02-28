import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import {
    getRetirementScenario,
    upsertRetirementScenario,
} from "$lib/server/db/queries";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const user = requireLogin(event);
    const scenario = await getRetirementScenario(db, user.id);
    return { scenario };
};

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

export const actions: Actions = {
    save: async (event) => {
        const user = requireLogin(event);
        const data = await event.request.formData();

        const currentValue = parseOptionalInt(data.get("currentValue"));
        const annualSavings = parseOptionalInt(data.get("annualSavings"));
        const annualExpenses = parseOptionalInt(data.get("annualExpenses"));
        const safeWithdrawalRate = parseOptionalInt(
            data.get("safeWithdrawalRate"),
        );
        const expectedRealReturn = parseOptionalInt(
            data.get("expectedRealReturn"),
        );
        const yearAdjustment = Number(data.get("yearAdjustment")) || 5;

        await upsertRetirementScenario(db, user.id, {
            currentValue:
                currentValue != null ? Math.round(currentValue * 100) : null,
            annualSavings:
                annualSavings != null ? Math.round(annualSavings * 100) : null,
            annualExpenses:
                annualExpenses != null
                    ? Math.round(annualExpenses * 100)
                    : null,
            safeWithdrawalRate:
                safeWithdrawalRate != null
                    ? Math.round(safeWithdrawalRate * 100)
                    : null,
            expectedRealReturn:
                expectedRealReturn != null
                    ? Math.round(expectedRealReturn * 100)
                    : null,
            yearAdjustment,
        });
    },
};
