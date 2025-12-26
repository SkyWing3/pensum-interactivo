import { NextResponse } from "next/server";
import { prisma, ensureDb } from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: Request) {
  await ensureDb();
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  const data = verifyToken(token);
  if (!data) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const records = await prisma.userCourse.findMany({ where: { userId: data.userId } });
  const map: Record<string, string> = {};
  records.forEach(r => (map[r.courseId] = r.status));
  return NextResponse.json(map);
}

export async function POST(req: Request) {
  await ensureDb();
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  const data = verifyToken(token);
  if (!data) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId, status } = await req.json();
  await prisma.userCourse.upsert({
    where: { userId_courseId: { userId: data.userId, courseId } },
    update: { status },
    create: { userId: data.userId, courseId, status },
  });
  return NextResponse.json({ ok: true });
}