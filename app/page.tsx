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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-4">
        <div className="bg-white/80 backdrop-blur p-8 rounded-xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
            {form.mode === "login" ? "Iniciar Sesión" : "Registro"}
          </h1>
          <input
            type="email"
            placeholder="Correo"
            className="border p-3 w-full mb-3 rounded"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="border p-3 w-full mb-4 rounded"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button
            onClick={handleAuth}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded mb-3 transition-colors"
          >
            {form.mode === "login" ? "Ingresar" : "Registrarse"}
          </button>
          {form.mode === "login" && (
            <div className="text-right mb-3">
              <a href="/forgot" className="text-sm text-indigo-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}
          <p className="text-sm text-center">
            {form.mode === "login" ? (
              <span>
                ¿No tienes cuenta?{' '}
                <button
                  className="text-indigo-600"
                  onClick={() => setForm({ ...form, mode: "register" })}
                >
                  Regístrate
                </button>
              </span>
            ) : (
              <span>
                ¿Ya tienes cuenta?{' '}
                <button
                  className="text-indigo-600"
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          Pensum de Ingeniería de Sistemas
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
          }}
          className="text-sm text-indigo-600 underline"
        >
          Cerrar sesión
        </button>
      </div>
      {semesters.map(s => (
        <div key={s} className="mb-8">
          <h2 className="font-semibold mb-4 text-indigo-600">Semestre {s}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
  );
}
