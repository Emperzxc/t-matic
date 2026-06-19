import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import type { SessionUser, UserRole } from "@/lib/auth";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled";
  created_at: string;
  updated_at: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function createUserWithPassword({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  const existing = await sql`
    select id::text
    from users
    where lower(email) = lower(${normalizedEmail})
    limit 1
  ` as { id: string }[];

  if (existing[0]) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(password);
  const rows = await sql`
    insert into users (name, email, password_hash, role, status)
    values (${normalizedName}, ${normalizedEmail}, ${passwordHash}, 'user', 'active')
    returning id::text, email, name, role, status
  ` as SessionUser[];

  return rows[0];
}

export async function findOrCreateOAuthUser({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("The social account did not provide an email address.");
  }

  const existing = await sql`
    select id::text, email, name, role, status
    from users
    where lower(email) = lower(${normalizedEmail})
    limit 1
  ` as SessionUser[];

  if (existing[0]) {
    if (existing[0].status !== "active") {
      throw new Error("This account has been disabled.");
    }
    return existing[0];
  }

  const generatedPasswordHash = await hashPassword(crypto.randomUUID());
  const displayName = name?.trim() || normalizedEmail.split("@")[0] || "T-Matic user";
  const rows = await sql`
    insert into users (name, email, password_hash, role, status)
    values (${displayName}, ${normalizedEmail}, ${generatedPasswordHash}, 'user', 'active')
    returning id::text, email, name, role, status
  ` as SessionUser[];

  return rows[0];
}

export async function listUsers({
  q = "",
  role = "all",
  status = "all",
  sort = "created_at",
  dir = "desc",
  page = 1,
  pageSize = 10,
}: {
  q?: string;
  role?: string;
  status?: string;
  sort?: string;
  dir?: string;
  page?: number;
  pageSize?: number;
}) {
  const safeSort = ["name", "email", "role", "status", "created_at"].includes(sort)
    ? sort
    : "created_at";
  const safeDir = dir === "asc" ? "asc" : "desc";
  const safeRole = ["super_admin", "user"].includes(role) ? role : null;
  const safeStatus = ["active", "disabled"].includes(status) ? status : null;
  const offset = Math.max(page - 1, 0) * pageSize;
  const search = `%${q}%`;

  const rows = await sql`
    select id::text, name, email, role, status, created_at::text, updated_at::text
    from users
    where (${q} = '' or name ilike ${search} or email ilike ${search})
      and (${safeRole}::text is null or role::text = ${safeRole})
      and (${safeStatus}::text is null or status::text = ${safeStatus})
    order by
      case when ${safeSort} = 'name' and ${safeDir} = 'asc' then name end asc,
      case when ${safeSort} = 'name' and ${safeDir} = 'desc' then name end desc,
      case when ${safeSort} = 'email' and ${safeDir} = 'asc' then email end asc,
      case when ${safeSort} = 'email' and ${safeDir} = 'desc' then email end desc,
      case when ${safeSort} = 'role' and ${safeDir} = 'asc' then role end asc,
      case when ${safeSort} = 'role' and ${safeDir} = 'desc' then role end desc,
      case when ${safeSort} = 'status' and ${safeDir} = 'asc' then status end asc,
      case when ${safeSort} = 'status' and ${safeDir} = 'desc' then status end desc,
      case when ${safeSort} = 'created_at' and ${safeDir} = 'asc' then created_at end asc,
      case when ${safeSort} = 'created_at' and ${safeDir} = 'desc' then created_at end desc
    limit ${pageSize}
    offset ${offset}
  ` as ManagedUser[];

  const countRows = await sql`
    select count(*)::text
    from users
    where (${q} = '' or name ilike ${search} or email ilike ${search})
      and (${safeRole}::text is null or role::text = ${safeRole})
      and (${safeStatus}::text is null or status::text = ${safeStatus})
  ` as { count: string }[];

  return {
    rows,
    total: Number(countRows[0]?.count ?? 0),
    page,
    pageSize,
  };
}
