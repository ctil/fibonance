import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): DrizzleDB {
    const url = env.TURSO_DATABASE_URL;
    const authToken = env.TURSO_AUTH_TOKEN;

    if ((!url || !authToken) && !url?.startsWith("file:")) {
        throw new Error(
            "Database configuration missing: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required",
        );
    }

    const client = createClient({
        url,
        authToken,
    });

    return drizzle(client, { schema });
}

export const db = createDb();
