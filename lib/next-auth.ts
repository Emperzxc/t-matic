import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { findOrCreateOAuthUser } from "@/lib/users";
import type { SessionUser } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: SessionUser;
  }
}

export const oauthProviderStatus = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(oauthProviderStatus.google
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ profile }) {
      try {
        const email = typeof profile?.email === "string" ? profile.email : null;
        const name = typeof profile?.name === "string" ? profile.name : null;
        await findOrCreateOAuthUser({ email, name });
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        const user = await findOrCreateOAuthUser({
          email: String(profile.email),
          name: typeof profile.name === "string" ? profile.name : null,
        });
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
};
