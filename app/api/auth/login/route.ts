import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { signToken } from '../../../../lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  const token = signToken(user.id);
  return NextResponse.json({ token });
}
