import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import {
    portfolios,
    stockAllocations,
    user,
} from "../src/lib/server/db/schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client);

const SEED_DATA = [
    {
        name: "Equities only",
        stocks: [
            {
                symbol: "VTI",
                alternatives: ["FSKAX"],
                targetPercentage: 80,
                description: "Total Market Fund",
            },
            {
                symbol: "VXUS",
                alternatives: ["FTIHX"],
                targetPercentage: 20,
                description: "International Fund",
            },
        ],
    },
    {
        name: "No Bonds",
        stocks: [
            {
                symbol: "VTI",
                alternatives: ["FSKAX"],
                targetPercentage: 79,
                description: "Total Market Fund",
            },
            {
                symbol: "VXUS",
                alternatives: ["FTIHX"],
                targetPercentage: 20,
                description: "International Fund",
            },
            { symbol: "FBTC", targetPercentage: 1, description: "Bitcoin ETF" },
        ],
    },
    {
        name: "Full Portfolio",
        stocks: [
            {
                symbol: "VTI",
                alternatives: ["FSKAX"],
                targetPercentage: 71,
                description: "Total Market Fund",
            },
            {
                symbol: "VXUS",
                alternatives: ["FTIHX"],
                targetPercentage: 18,
                description: "International Fund",
            },
            { symbol: "BND", targetPercentage: 10, description: "Bond Fund" },
            { symbol: "FBTC", targetPercentage: 1, description: "Bitcoin ETF" },
        ],
    },
];

async function seed() {
    console.log("Seeding database...");

    const [email] = Bun.argv.slice(2);

    if (!email) {
        console.error("Usage: bun scripts/seed.ts <email>");
        console.error("Create the account first with: bun run set-password");
        process.exit(1);
    }

    const [existing] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email));

    if (!existing) {
        console.error(`No user found with email "${email}".`);
        console.error("Create the account first with: bun run set-password");
        process.exit(1);
    }

    const userId = existing.id;

    await db.delete(stockAllocations);
    await db.delete(portfolios);

    for (const portfolio of SEED_DATA) {
        const [inserted] = await db
            .insert(portfolios)
            .values({
                name: portfolio.name,
                userId,
            })
            .returning({ id: portfolios.id });

        console.log(
            `Created portfolio: ${portfolio.name} (id: ${inserted.id})`,
        );

        for (let i = 0; i < portfolio.stocks.length; i++) {
            const stock = portfolio.stocks[i];
            await db.insert(stockAllocations).values({
                portfolioId: inserted.id,
                symbol: stock.symbol,
                alternatives: stock.alternatives,
                targetPercentage: stock.targetPercentage,
                description: stock.description,
                sortOrder: i,
            });
        }

        console.log(`  Added ${portfolio.stocks.length} stock allocations`);
    }

    console.log("Seeding complete!");
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
