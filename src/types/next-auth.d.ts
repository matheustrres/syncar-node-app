import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: string;
      companyName?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    plan: string;
    companyName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan: string;
    companyName?: string | null;
  }
}