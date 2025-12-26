import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, ensureDb } from "../../../../lib/prisma";
import { signToken } from "../../../../lib/auth";

export async function POST(req: Request) {
  await ensureDb();
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists)
    return NextResponse.json({ error: "User exists" }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  const token = signToken(user.id);
  return NextResponse.json({ token });
}