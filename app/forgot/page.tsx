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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-4">
      <div className="bg-white/80 backdrop-blur p-8 rounded-xl shadow-xl w-full max-w-md">
        {sent ? (
          <>
            <p className="text-center text-indigo-700">Revisa tu correo para continuar.</p>
            {preview && (
              <p className="text-center mt-4">
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 underline"
                >
                  Ver correo de prueba
                </a>
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">Recuperar contraseña</h1>
            {error && (
              <p className="text-center text-red-500 mb-4">{error}</p>
            )}
            <input
              type="email"
              placeholder="Correo"
              className="border p-3 w-full mb-4 rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              onClick={handle}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded transition-colors"
            >
              Enviar enlace
            </button>
          </>
        )}
      </div>
    </div>
  );
}
