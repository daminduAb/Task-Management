import { PrismaClient } from "@prisma/client";

// Reuse a single Prisma instance across the app (best practice, avoids exhausting DB connections)
const prisma = new PrismaClient();

export default prisma;
