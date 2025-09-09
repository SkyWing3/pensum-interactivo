"use client";
import { useState } from 'react';

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <div className="bg-[var(--color-surface)] p-8 rounded shadow w-full max-w-md">
        {sent ? (
          <>
            <p className="text-center text-[var(--color-primary)]">Revisa tu correo para continuar.</p>
            {preview && (
              <p className="text-center mt-4">
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-primary)] underline"
                >
                  Ver correo de prueba
                </a>
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-[var(--color-primary)]">Recuperar contraseña</h1>
            {error && (
              <p className="text-center text-red-500 mb-4">{error}</p>
            )}
            <input
              type="email"
              placeholder="Correo"
              className="border border-gray-300 p-3 w-full mb-4 rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              onClick={handle}
              className="bg-[var(--color-primary)] hover:bg-[#004966] text-white w-full py-2 rounded"
            >
              Enviar enlace
            </button>
          </>
        )}
      </div>
    </div>
  );
}
