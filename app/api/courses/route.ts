import { NextResponse } from "next/server";
import { courses } from "../../../data/courses";
import { ensureDb } from "../../../lib/prisma";

export async function GET() {
  await ensureDb();
  return NextResponse.json(courses);
}