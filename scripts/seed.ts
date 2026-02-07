import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { hash } from "@node-rs/argon2";
import {
    portfolios,
    stockAllocations,
    users,
    sessions,
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
        name: "No Bonds",
        stocks: [
            {
                symbol: "VTI",
                targetPercentage: 80,
                description: "Total Market Fund",
            },
            {
                symbol: "VXUS",
                targetPercentage: 20,
                description: "International Fund",
            },
        ],
    },
    {
        name: "Indexes only",
        stocks: [
            {
                symbol: "VTI",
                targetPercentage: 79,
                description: "Total Market Fund",
            },
            {
                symbol: "VXUS",
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
                targetPercentage: 71,
                description: "Total Market Fund",
            },
            {
                symbol: "VXUS",
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

    const [username, password] = Bun.argv.slice(2);

    if (!username || !password) {
        console.error(
            "Usage: bun scripts/register-user.ts <username> <password>",
        );
        process.exit(1);
    }

    await db.delete(stockAllocations);
    await db.delete(sessions);
    await db.delete(portfolios);
    await db.delete(users);

    const userId = crypto.randomUUID();
    const passwordHash = await hash(password);

    await db.insert(users).values({ id: userId, username, passwordHash });
    console.log(`User "${username}" registered successfully.`);

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
