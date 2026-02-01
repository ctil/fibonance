import { hash } from "@node-rs/argon2";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { user } from "../src/lib/server/db/schema";

const [username, password] = Bun.argv.slice(2);

if (!username || !password) {
    console.error("Usage: bun scripts/register-user.ts <username> <password>");
    process.exit(1);
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if ((!url || !authToken) && !url?.startsWith("file:")) {
    console.error(
        "Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are required",
    );
    process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client);

const id = crypto.randomUUID();
const passwordHash = await hash(password);

await db.insert(user).values({ id, username, passwordHash });
console.log(`User "${username}" registered successfully.`);
