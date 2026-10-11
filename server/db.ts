  import dotenv from "dotenv";
  import path from "node:path";
  import { fileURLToPath } from "node:url";
  import { randomBytes } from "node:crypto";
  import { PrismaClient } from "@prisma/client";

  const serverDir = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(serverDir, "../.env") });

  declare global {
    // Prevent multiple instances of Prisma Client in development
    var prismaGlobal: PrismaClient | undefined;
  }

  export const prisma =
    global.prismaGlobal ||
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    global.prismaGlobal = prisma;
  }

  /**
   * Seed initial sample records in PostgreSQL if tables are empty
   */
  export async function seedInitialDataIfEmpty() {
    // No hardcoded dummy records are inserted
  }
