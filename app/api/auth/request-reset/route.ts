import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const exp = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExp: exp },
    });
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset/${token}`;
    await transport.sendMail({
      to: email,
      from: process.env.SMTP_FROM || 'noreply@example.com',
      subject: 'Restablece tu contraseña',
      text: `Ingresa al siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
    });
  }
  return NextResponse.json({ ok: true });
}
