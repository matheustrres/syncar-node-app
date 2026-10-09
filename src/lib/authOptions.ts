import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { bcryptHashSchema, loginCredentialsSchema } from "./auth-validation";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginCredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        try {
          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
          });
          if (!user || !bcryptHashSchema.safeParse(user.password).success) return null;
          const passwordMatch = await bcrypt.compare(parsed.data.password, user.password);
          if (!passwordMatch) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            companyName: user.companyName,
            plan: user.plan,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            name: true,
            email: true,
            plan: true,
            companyName: true,
          },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.plan = dbUser.plan;
          token.companyName = dbUser.companyName;
        }
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.companyName = session.user.companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.companyName = token.companyName;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
