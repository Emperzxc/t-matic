import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
  console.warn("DATABASE_URL is not set. Database-backed routes will fail until configured.");
}

export const sql = neon(
  process.env.DATABASE_URL ?? "postgresql://missing:missing@localhost:5432/missing",
);
