import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user user:email repo" } },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await db.select().from(users).where(eq(users.email, credentials.email as string));
        const user = result[0];

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      // Harden OAuth linking: require email verification from the provider if possible
      if (account?.provider === "google" && profile && !profile.email_verified) {
        return false;
      }
      
      try {
        const dbUser = await db.select().from(users).where(eq(users.email, user.email));
        if (dbUser.length === 0) {
          await db.insert(users).values({
            email: user.email,
            name: user.name || "",
            provider: account?.provider || "oauth",
          });
        }
        return true;
      } catch (e: any) {
        console.error("\n[NextAuth Error] signIn callback failed! Is the Neon DB paused or connection string invalid?", e);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (account?.access_token) {
          token.accessToken = account.access_token;
        }
        if (user?.email) {
          const dbUser = await db.select().from(users).where(eq(users.email, user.email));
          if (dbUser.length > 0) {
            token.id = dbUser[0].id;
          } else if (user.id) {
            token.id = user.id;
          }
        }
      } catch (e: any) {
        console.error("[NextAuth Error] jwt callback failed querying DB:", e);
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/ide`;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/ide`;
    },
  },
});
