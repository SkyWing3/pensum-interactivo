import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma, ensureDb } from "../../../../lib/prisma";

export async function POST(req: Request) {
  await ensureDb();
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  let preview: string | undefined;

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const exp = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExp: exp },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset/${token}`;

    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const info = await transporter.sendMail({
      to: email,
      from: process.env.SMTP_FROM || "noreply@example.com",
      subject: "Restablece tu contraseña",
      text: `Ingresa al siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
    });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      preview = nodemailer.getTestMessageUrl(info) || undefined;
    }
  }

  return NextResponse.json({ ok: true, preview });
}