"use client";
import { useState } from "react";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handle = async () => {
    const res = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      setSent(true);
      setError(null);
      setPreview(data?.preview ?? null);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "No se pudo enviar el correo");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/85 p-8 shadow-lg backdrop-blur">
        {sent ? (
          <>
            <p className="text-center text-sm text-[var(--color-ink)]">
              Revisa tu correo para continuar.
            </p>
            {preview && (
              <p className="text-center mt-4">
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--color-accent)] underline"
                >
                  Ver correo de prueba
                </a>
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-4 text-center text-[var(--color-heading)]">
              Recuperar contraseña
            </h1>
            <p className="text-sm text-center text-[var(--color-muted)] mb-6">
              Te enviaremos un enlace para restablecer tu acceso.
            </p>
            {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}
            <input
              type="email"
              placeholder="Correo"
              className="border border-slate-200 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              onClick={handle}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] text-white w-full py-2 rounded-lg text-sm font-semibold"
            >
              Enviar enlace
            </button>
          </>
        )}
      </div>
    </div>
  );
}