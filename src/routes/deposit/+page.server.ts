import { fail } from "@sveltejs/kit";
import { requireLogin } from "$lib/server/auth";
import {
    getPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
} from "$lib/server/portfolios";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const user = requireLogin(event);
    const portfolios = await getPortfolios(user.id);

    return {
        portfolios,
        user,
    };
};

interface StockInput {
    symbol: string;
    targetPercentage: number;
    alternatives?: string[];
}

function parseStocks(formData: FormData): {
    stocks: StockInput[];
    error?: string;
} {
    const stocksJson = formData.get("stocks");
    if (typeof stocksJson !== "string") {
        return { stocks: [], error: "Missing stock data" };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(stocksJson);
    } catch {
        return { stocks: [], error: "Invalid stock data" };
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
        return { stocks: [], error: "At least one stock is required" };
    }

    const stocks: StockInput[] = [];
    for (const item of parsed) {
        const symbol = String(item.symbol ?? "")
            .trim()
            .toUpperCase();
        const targetPercentage = Number(item.targetPercentage);

        if (!symbol) {
            return { stocks: [], error: "Each stock must have a symbol" };
        }
        if (
            !Number.isInteger(targetPercentage) ||
            targetPercentage < 1 ||
            targetPercentage > 100
        ) {
            return {
                stocks: [],
                error: `Stock ${symbol}: percentage must be an integer between 1 and 100`,
            };
        }
        const alternativesRaw = String(item.alternatives ?? "").trim();
        const alternatives = alternativesRaw
            ? alternativesRaw
                  .split(",")
                  .map((s: string) => s.trim().toUpperCase())
                  .filter(Boolean)
            : undefined;

        stocks.push({ symbol, targetPercentage, alternatives });
    }

    const sum = stocks.reduce((s, st) => s + st.targetPercentage, 0);
    if (sum !== 100) {
        return {
            stocks: [],
            error: `Percentages must sum to 100 (currently ${sum})`,
        };
    }

    return { stocks };
}

export const actions: Actions = {
    create: async (event) => {
        const user = requireLogin(event);
        const formData = await event.request.formData();

        const name = String(formData.get("name") ?? "").trim();
        if (!name) {
            return fail(400, { message: "Portfolio name is required" });
        }

        const { stocks, error } = parseStocks(formData);
        if (error) {
            return fail(400, { message: error });
        }

        try {
            await createPortfolio(user.id, { name, stocks });
        } catch (e: unknown) {
            if (
                e instanceof Error &&
                e.message.includes("UNIQUE constraint failed")
            ) {
                return fail(400, {
                    message: "A portfolio with that name already exists",
                });
            }
            throw e;
        }
    },

    update: async (event) => {
        const user = requireLogin(event);
        const formData = await event.request.formData();

        const portfolioId = Number(formData.get("portfolioId"));
        if (!portfolioId || !Number.isInteger(portfolioId)) {
            return fail(400, { message: "Invalid portfolio ID" });
        }

        const name = String(formData.get("name") ?? "").trim();
        if (!name) {
            return fail(400, { message: "Portfolio name is required" });
        }

        const { stocks, error } = parseStocks(formData);
        if (error) {
            return fail(400, { message: error });
        }

        try {
            const updated = await updatePortfolio(portfolioId, user.id, {
                name,
                stocks,
            });
            if (!updated) {
                return fail(404, { message: "Portfolio not found" });
            }
        } catch (e: unknown) {
            if (
                e instanceof Error &&
                e.message.includes("UNIQUE constraint failed")
            ) {
                return fail(400, {
                    message: "A portfolio with that name already exists",
                });
            }
            throw e;
        }
    },

    delete: async (event) => {
        const user = requireLogin(event);
        const formData = await event.request.formData();

        const portfolioId = Number(formData.get("portfolioId"));
        if (!portfolioId || !Number.isInteger(portfolioId)) {
            return fail(400, { message: "Invalid portfolio ID" });
        }

        const deleted = await deletePortfolio(portfolioId, user.id);
        if (!deleted) {
            return fail(404, { message: "Portfolio not found" });
        }
    },
};
