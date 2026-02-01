import { db } from "$lib/server/db";
import { getPortfoliosFromDb, type Portfolio } from "$lib/server/db/queries";

export async function getPortfolios(userId: string): Promise<Portfolio[]> {
    return getPortfoliosFromDb(db, userId);
}

export type { Portfolio };
