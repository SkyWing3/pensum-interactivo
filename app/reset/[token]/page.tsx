"use client";
import { useState } from "react";
import Link from "next/link";

export default function Reset({ params }: { params: { token: string } }) {
  const { token } = params;
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const handle = async () => {
    await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/85 p-8 shadow-lg backdrop-blur">
        {done ? (
          <p className="text-center text-sm text-[var(--color-ink)]">
            Contraseña actualizada. Ya puedes{" "}
            <Link href="/" className="text-[var(--color-accent)] underline">
              iniciar sesión
            </Link>
            .
          </p>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-4 text-center text-[var(--color-heading)]">
              Restablecer contraseña
            </h1>
            <p className="text-sm text-center text-[var(--color-muted)] mb-6">
              Define una nueva contraseña segura.
            </p>
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="border border-slate-200 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              onClick={handle}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] text-white w-full py-2 rounded-lg text-sm font-semibold"
            >
              Guardar
            </button>
          </>
        )}
      </div>
    </div>
  );
}