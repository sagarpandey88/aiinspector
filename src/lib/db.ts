import { Pool } from "pg";

declare global {
  // Prevent multiple Pool instances in dev with hot-reload
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  const wantSsl =
    process.env.PGSSLMODE === "require" ||
    process.env.DATABASE_SSL === "true" ||
    (typeof connectionString === "string" && connectionString.includes("sslmode=require"));

  if (connectionString) {
    return new Pool({ connectionString, max: 10, ssl: wantSsl ? { rejectUnauthorized: false } : false });
  }

  return new Pool({
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? "aiinspector",
    user: process.env.POSTGRES_USER ?? "aiinspector",
    password: process.env.POSTGRES_PASSWORD,
    max: 10,
    ssl: wantSsl ? { rejectUnauthorized: false } : false,
  });
}

export const pool: Pool =
  process.env.NODE_ENV === "production"
    ? createPool()
    : (globalThis._pgPool ??= createPool());
