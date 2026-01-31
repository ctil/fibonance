import { createClient, type Client } from "@libsql/client";
import { env } from "$env/dynamic/private";

let client: Client | null = null;

export function getDbClient(): Client | null {
    if (client) return client;

    const url = env.TURSO_DATABASE_URL;
    const authToken = env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        return null;
    }

    client = createClient({
        url,
        authToken,
    });

    return client;
}

export function isDbAvailable(): boolean {
    return !!env.TURSO_DATABASE_URL && !!env.TURSO_AUTH_TOKEN;
}
