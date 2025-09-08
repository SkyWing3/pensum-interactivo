import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  const { token, password } = await req.json();
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExp: { gt: new Date() } },
  });
  if (!user)
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExp: null },
  });
  return NextResponse.json({ ok: true });
}
