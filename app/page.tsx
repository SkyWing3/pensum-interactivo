"use client";

import { useState, useEffect } from 'react';
import CourseCard from "../components/CourseCard";

interface Course {
  id: string;
  name: string;
  semester: number;
  prerequisites: string[];
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ email: "", password: "", mode: "login" });

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token) {
      fetch("/api/courses").then(res => res.json()).then(setCourses);
      fetch("/api/user-courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(setStatuses);
    }
  }, [token]);

  const handleAuth = async () => {
    const res = await fetch(`/api/auth/${form.mode === "login" ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert(data.error || "Error");
    }
  };

  const toggleCourse = async (id: string) => {
    if (!token) return;
    const newStatus = statuses[id] === "approved" ? "pending" : "approved";
    setStatuses({ ...statuses, [id]: newStatus });
    await fetch("/api/user-courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId: id, status: newStatus }),
    });
  };

  const statusFor = (id: string) => statuses[id] || "pending";

  const isAvailable = (id: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return false;
    return course.prerequisites.every(pr => statusFor(pr) === "approved");
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
        <div className="bg-[var(--color-surface)] p-8 rounded shadow w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-[var(--color-primary)]">
            {form.mode === "login" ? "Iniciar Sesión" : "Registro"}
          </h1>
          <input
            type="email"
            placeholder="Correo"
            className="border border-gray-300 p-3 w-full mb-3 rounded"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="border border-gray-300 p-3 w-full mb-4 rounded"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button
            onClick={handleAuth}
            className="bg-[var(--color-primary)] hover:bg-[#004966] text-white w-full py-2 rounded mb-3"
          >
            {form.mode === "login" ? "Ingresar" : "Registrarse"}
          </button>
          {form.mode === "login" && (
            <div className="text-right mb-3">
              <a href="/forgot" className="text-sm text-[var(--color-primary)] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}
          <p className="text-sm text-center">
            {form.mode === "login" ? (
              <span>
                ¿No tienes cuenta?{' '}
                <button
                  className="text-[var(--color-primary)]"
                  onClick={() => setForm({ ...form, mode: "register" })}
                >
                  Regístrate
                </button>
              </span>
            ) : (
              <span>
                ¿Ya tienes cuenta?{' '}
                <button
                  className="text-[var(--color-primary)]"
                  onClick={() => setForm({ ...form, mode: "login" })}
                >
                  Inicia sesión
                </button>
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  const semesters = Array.from(new Set(courses.map(c => c.semester))).sort();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--color-primary)] text-white p-4 flex justify-between items-center">
        <h1 className="font-bold">Carrera de Ingeniería de Sistemas</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
          }}
          className="underline"
        >
          Cerrar sesión
        </button>
      </header>
      <div className="flex flex-1 overflow-x-auto">
        <aside className="hidden md:flex w-24 bg-[var(--color-secondary)] items-center justify-center font-semibold text-[var(--color-text)]">
          <span className="rotate-[-90deg]">Semestres</span>
        </aside>
        <main className="flex-1 p-6">
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${semesters.length}, minmax(0,1fr))` }}
          >
            {semesters.map(s => (
              <div key={s}>
                <div className="bg-[var(--color-secondary)] text-center font-semibold py-2 text-[var(--color-text)]">
                  Semestre {s}
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  {courses
                    .filter(c => c.semester === s)
                    .map(c => (
                      <CourseCard
                        key={c.id}
                        course={c}
                        status={statusFor(c.id)}
                        available={isAvailable(c.id)}
                        toggle={() => toggleCourse(c.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
