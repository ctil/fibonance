import { getPortfolios } from "$lib/server/portfolios";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const portfolios = await getPortfolios();

    return {
        portfolios,
    };
};
