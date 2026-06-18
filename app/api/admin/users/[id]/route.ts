import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/users";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["super_admin", "user"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;
    const input = updateSchema.parse(await request.json());
    if (admin.id === id && input.status === "disabled") {
      return NextResponse.json({ error: "You cannot disable your own account." }, { status: 400 });
    }
    const passwordHash = input.password ? await hashPassword(input.password) : null;

    const rows = await sql`
      update users
      set
        name = coalesce(${input.name ?? null}, name),
        email = coalesce(${input.email?.toLowerCase() ?? null}, email),
        password_hash = coalesce(${passwordHash}, password_hash),
        role = coalesce(${input.role ?? null}, role),
        status = coalesce(${input.status ?? null}, status),
        updated_at = now()
      where id = ${id}
      returning id::text, name, email, role, status, created_at::text, updated_at::text
    `;
    if (!rows[0]) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update user.";
    return NextResponse.json({ error: message }, { status: message === "Forbidden" ? 403 : 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;
    if (admin.id === id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }
    await sql`delete from users where id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete user.";
    return NextResponse.json({ error: message }, { status: message === "Forbidden" ? 403 : 400 });
  }
}
