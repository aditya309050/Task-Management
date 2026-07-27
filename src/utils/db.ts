import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing!");
}

// Ensure SSL is explicitly configured for external Render connections
const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export const prisma = new PrismaClient({ adapter });
