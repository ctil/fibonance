import { db } from "$lib/server/db";
import {
    getPortfoliosFromDb,
    createPortfolioInDb,
    updatePortfolioInDb,
    deletePortfolioInDb,
    type Portfolio,
    type PortfolioInput,
} from "$lib/server/db/queries";

export async function getPortfolios(userId: string): Promise<Portfolio[]> {
    return getPortfoliosFromDb(db, userId);
}

export async function createPortfolio(
    userId: string,
    data: PortfolioInput,
): Promise<void> {
    return createPortfolioInDb(db, userId, data);
}

export async function updatePortfolio(
    portfolioId: number,
    userId: string,
    data: PortfolioInput,
): Promise<boolean> {
    return updatePortfolioInDb(db, portfolioId, userId, data);
}

export async function deletePortfolio(
    portfolioId: number,
    userId: string,
): Promise<boolean> {
    return deletePortfolioInDb(db, portfolioId, userId);
}

export type { Portfolio, PortfolioInput };
