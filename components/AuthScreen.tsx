"use client";

import { useState } from "react";

interface AuthScreenProps {
  onSuccess: (token: string) => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [form, setForm] = useState({ email: "", password: "", mode: "login" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/auth/${form.mode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        }
      );
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        onSuccess(data.token);
      } else {
        setError(data.error || "Error desconocido");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[1.1fr_0.9fr] bg-[var(--color-background)]">
      <div className="hidden md:flex flex-col justify-between p-12 bg-[radial-gradient(circle_at_top,_rgba(15,107,107,0.18),_transparent_55%),linear-gradient(120deg,_#f6f2e9,_#ffffff)]">
        <div className="space-y-6 max-w-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Escuela de Ingeniería de Sistemas
          </p>
          <h1 className="text-4xl font-semibold text-[var(--color-heading)]">
            Malla curricular 2026
          </h1>
          <p className="text-lg text-[var(--color-ink)]">
            Planifica tu avance por semestres, controla UVE aprobadas y
            visualiza requisitos en una sola vista.
          </p>
          <div className="grid gap-4">
            {[
              "Seguimiento por área académica",
              "Estado de prerrequisitos en tiempo real",
              "Resumen de UVE aprobadas y pendientes",
              "Panel de control para próximos cursos",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          Datos basados en la malla oficial UCB 2026 · Implementación desde 2024
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/80 p-8 shadow-lg backdrop-blur">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--color-heading)]">
              {form.mode === "login" ? "Acceso" : "Crear cuenta"}
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Usa tu correo institucional o personal.
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Correo"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-semibold text-white shadow hover:bg-[var(--color-accent-strong)] disabled:opacity-50 transition-colors"
            >
              {loading
                ? "Cargando..."
                : form.mode === "login"
                ? "Ingresar"
                : "Registrarse"}
            </button>
            {form.mode === "login" && (
              <a
                href="/forgot"
                className="block text-center text-sm text-[var(--color-accent)] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            )}
            <div className="text-center text-sm text-[var(--color-muted)]">
              {form.mode === "login"
                ? "¿No tienes cuenta?"
                : "¿Ya tienes cuenta?"}{" "}
              <button
                className="font-semibold text-[var(--color-heading)] hover:underline"
                onClick={() =>
                  setForm({
                    ...form,
                    mode: form.mode === "login" ? "register" : "login",
                  })
                }
              >
                {form.mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
