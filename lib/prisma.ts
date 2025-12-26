import { PrismaClient } from "@prisma/client";
import { courses } from "../data/courses";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

let dbInitPromise: Promise<void> | null = null;

async function initSqlite() {
  const tables = await prisma.$queryRaw<{ name: string }[]>`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name = 'Course'
  `;

  if (tables.length === 0) {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        resetToken TEXT,
        resetTokenExp DATETIME
      )
    `;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Course" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        semester INTEGER NOT NULL,
        prerequisites TEXT NOT NULL
      )
    `;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserCourse" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        courseId TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES "User"(id),
        FOREIGN KEY (courseId) REFERENCES "Course"(id)
      )
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "UserCourse_userId_courseId_key"
      ON "UserCourse"(userId, courseId)
    `;
  }

  for (const c of courses) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: { name: c.name, semester: c.semester, prerequisites: c.prerequisites },
      create: {
        id: c.id,
        name: c.name,
        semester: c.semester,
        prerequisites: c.prerequisites,
      },
    });
  }
}

export async function ensureDb() {
  if (!dbInitPromise) {
    dbInitPromise = initSqlite();
  }

  return dbInitPromise;
}