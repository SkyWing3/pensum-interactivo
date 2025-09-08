import { PrismaClient } from '@prisma/client';
import { courses } from '../data/courses';

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
