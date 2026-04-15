import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "USER" | "AUTHOR" | "ADMIN";
    } & DefaultSession["user"];
  }
  interface User {
    username?: string;
    role?: "USER" | "AUTHOR" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: "USER" | "AUTHOR" | "ADMIN";
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || user.banned) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl ?? undefined,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.username = (user as { username?: string }).username;
        token.role = (user as { role?: "USER" | "AUTHOR" | "ADMIN" }).role;
      }
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true, role: true, name: true, avatarUrl: true },
        });
        if (fresh) {
          token.username = fresh.username;
          token.role = fresh.role;
          token.name = fresh.name;
          token.picture = fresh.avatarUrl ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = (token.role as "USER" | "AUTHOR" | "ADMIN") ?? "USER";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const role = auth?.user?.role;

      if (nextUrl.pathname.startsWith("/admin")) {
        return loggedIn && role === "ADMIN";
      }
      if (
        nextUrl.pathname === "/write" ||
        nextUrl.pathname.startsWith("/settings") ||
        nextUrl.pathname.startsWith("/bookmarks")
      ) {
        return loggedIn;
      }
      return true;
    },
  },
});
