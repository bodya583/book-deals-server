import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "@prisma/config";

dotenv.config({ path: path.join(process.cwd(), "server", ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.DATABASE_URL_UNPOOLED,
  },
});