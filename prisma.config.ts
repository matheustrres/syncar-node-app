import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Keep Prisma CLI environment selection aligned with Next.js.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --esm prisma/seed.ts",
  },
});
