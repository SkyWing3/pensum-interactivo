import { PrismaClient } from '@prisma/client';
// Explicit extension to ensure Node can resolve the TypeScript module when
// running via ts-node
import { courses } from '../data/courses.ts';

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
