import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Mirror Next.js env priority: .env.local overrides .env.
// In production deployments env vars are injected by the platform so neither
// file matters; locally .env.local holds dev credentials.
// config({ path: ".env.local" });           // dev overrides (highest priority)
  config({ path: ".env.prod" }); // production overrides
config({ path: ".env", override: false }); // production base values (fallback)

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
