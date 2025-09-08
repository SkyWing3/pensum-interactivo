"use client";
import { useState } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-4">
      <div className="bg-white/80 backdrop-blur p-8 rounded-xl shadow-xl w-full max-w-md">
        {done ? (
          <p className="text-center text-indigo-700">
            Contraseña actualizada. Ya puedes{' '}
            <Link href="/" className="underline">iniciar sesión</Link>.
          </p>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">Restablecer contraseña</h1>
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="border p-3 w-full mb-4 rounded"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              onClick={handle}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded transition-colors"
            >
              Guardar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
