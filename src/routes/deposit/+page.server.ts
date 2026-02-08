import { requireLogin } from "$lib/server/auth";
import { getPortfolios } from "$lib/server/portfolios";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const user = requireLogin(event);
    const portfolios = await getPortfolios(user.id);

    return {
        portfolios,
        user,
    };
};
