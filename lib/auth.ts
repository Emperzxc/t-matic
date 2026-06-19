import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getServerSession } from "next-auth";
import { cache } from "react";
import { sql } from "@/lib/db";
import { authOptions } from "@/lib/next-auth";

export type UserRole = "super_admin" | "user";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "disabled";
};

const cookieName = "tmatic_session";

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(authSecret());

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (token) {
    try {
      const verified = await jwtVerify(token, authSecret());
      const payload = verified.payload as SessionUser;
      if (payload.id && payload.email && payload.status === "active") return payload;
    } catch {
      return null;
    }
  }

  const nextAuthSession = await getServerSession(authOptions);
  const user = nextAuthSession?.user;
  if (!user?.id || !user.email || user.status !== "active") return null;
  return user;
});

export async function getFreshSessionUser() {
  const session = await getSession();
  if (!session) return null;

  const rows = await sql`
    select id::text, email, name, role, status
    from users
    where id = ${session.id}
    limit 1
  ` as SessionUser[];

  return rows[0]?.status === "active" ? rows[0] : null;
}

export async function requireUser() {
  const user = await getFreshSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== "super_admin") throw new Error("Forbidden");
  return user;
}
