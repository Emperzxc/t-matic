import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/users";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["super_admin", "user"]),
  status: z.enum(["active", "disabled"]).default("active"),
});

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const input = createSchema.parse(await request.json());
    const passwordHash = await hashPassword(input.password);

    const rows = await sql`
      insert into users (name, email, password_hash, role, status)
      values (${input.name}, lower(${input.email}), ${passwordHash}, ${input.role}, ${input.status})
      returning id::text, name, email, role, status, created_at::text, updated_at::text
    `;
    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create user.";
    return NextResponse.json({ error: message }, { status: message === "Forbidden" ? 403 : 400 });
  }
}
