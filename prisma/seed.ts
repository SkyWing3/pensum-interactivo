import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
// Explicit extension to ensure Node can resolve the TypeScript module when
// running via ts-node
import { courses } from "../data/courses.ts";

const prisma = new PrismaClient();

async function main() {
  const seedEmail = process.env.SEED_USER_EMAIL || "admin@example.com";
  const seedPassword = process.env.SEED_USER_PASSWORD || "admin123";

  for (const c of courses) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        semester: c.semester,
        prerequisites: c.prerequisites,
      },
    });
  }

  const existing = await prisma.user.findUnique({ where: { email: seedEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(seedPassword, 10);
    await prisma.user.create({
      data: {
        email: seedEmail,
        password: hashed,
      },
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
