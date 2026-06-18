import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession, type SessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const rows = await sql`
      select id::text, email, name, role, status, password_hash
      from users
      where lower(email) = lower(${input.email})
      limit 1
    ` as (SessionUser & { password_hash: string })[];
    const user = rows[0];
    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
    await createSession(sessionUser);
    return NextResponse.json({ user: sessionUser });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed." },
      { status: 400 },
    );
  }
}
