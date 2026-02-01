import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

let db: DrizzleDB | null = null;

export function getDb(): DrizzleDB | null {
    if (db) return db;

    const url = env.TURSO_DATABASE_URL;
    const authToken = env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        return null;
    }

    const client = createClient({
        url,
        authToken,
    });

    db = drizzle(client, { schema });

    return db;
}

export function isDbAvailable(): boolean {
    return !!env.TURSO_DATABASE_URL && !!env.TURSO_AUTH_TOKEN;
}
