import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, requireUser, type SessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/users";

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const input = profileSchema.parse(await request.json());
    const passwordHash = input.password ? await hashPassword(input.password) : null;

    const rows = await sql`
      update users
      set
        name = ${input.name},
        email = lower(${input.email}),
        password_hash = coalesce(${passwordHash}, password_hash),
        updated_at = now()
      where id = ${user.id}
      returning id::text, email, name, role, status
    ` as SessionUser[];

    const updated = rows[0];
    if (!updated) return NextResponse.json({ error: "User not found." }, { status: 404 });
    await createSession(updated);
    return NextResponse.json({ user: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update profile.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
