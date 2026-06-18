import "./load-env";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function upsertUser({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "user";
}) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const sql = neon(process.env.DATABASE_URL);
  const passwordHash = await bcrypt.hash(password, 12);
  await sql`
    insert into users (name, email, password_hash, role, status)
    values (${name}, lower(${email}), ${passwordHash}, ${role}, 'active')
    on conflict (email) do update set
      name = excluded.name,
      password_hash = excluded.password_hash,
      role = excluded.role,
      status = 'active',
      updated_at = now()
  `;
}

async function main() {
  await upsertUser({
    name: "Michael Celestino",
    email: process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@t-matic.local",
    password: process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!",
    role: "super_admin",
  });

  await upsertUser({
    name: "Michael Researcher",
    email: process.env.SEED_USER_EMAIL ?? "researcher@t-matic.local",
    password: process.env.SEED_USER_PASSWORD ?? "ChangeMe123!",
    role: "user",
  });

  console.log("Seed complete.");
  console.log("Super admin:", process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@t-matic.local");
  console.log("User:", process.env.SEED_USER_EMAIL ?? "researcher@t-matic.local");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
