"use client";

import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import { courses, semesters } from "../data/courses";

interface UserData {
  password: string;
  courses: Record<string, "approved" | "pending">;
}

export default function Home() {
  const [user, setUser] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [form, setForm] = useState({ username: "", password: "", mode: "login" });

  useEffect(() => {
    const stored = localStorage.getItem("users");
    if (stored) setUsers(JSON.parse(stored));
  }, []);

  const saveUsers = (data: Record<string, UserData>) => {
    localStorage.setItem("users", JSON.stringify(data));
    setUsers(data);
  };

  const handleAuth = () => {
    const { username, password, mode } = form;
    if (!username || !password) return;
    const copy = { ...users };
    if (mode === "register") {
      if (copy[username]) {
        alert("Usuario ya registrado");
        return;
      }
      copy[username] = { password, courses: {} };
      saveUsers(copy);
      setUser(username);
    } else {
      if (!copy[username] || copy[username].password !== password) {
        alert("Credenciales incorrectas");
        return;
      }
      setUser(username);
    }
  };

  const toggleCourse = (id: string) => {
    if (!user) return;
    const copy = { ...users };
    const current = copy[user].courses[id] === "approved" ? "pending" : "approved";
    copy[user].courses[id] = current;
    saveUsers(copy);
  };

  const statusFor = (id: string): "approved" | "pending" => {
    if (!user) return "pending";
    return users[user].courses[id] || "pending";
  };

  const isAvailable = (id: string) => {
    const course = courses.find(c => c.id === id)!;
    return course.prerequisites.every(pr => statusFor(pr) === "approved");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded shadow w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">
            {form.mode === "login" ? "Iniciar Sesión" : "Registrarse"}
          </h1>
          <input
            type="text"
            placeholder="Usuario"
            className="border p-2 w-full mb-2"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="border p-2 w-full mb-4"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button
            onClick={handleAuth}
            className="bg-blue-600 text-white w-full py-2 rounded mb-2 hover:bg-blue-700 transition-colors"
          >
            {form.mode === "login" ? "Ingresar" : "Registrar"}
          </button>
          <p className="text-sm text-center">
            {form.mode === "login" ? (
              <span>
                ¿No tienes cuenta?{' '}
                <button className="text-blue-600" onClick={() => setForm({ ...form, mode: "register" })}>
                  Regístrate
                </button>
              </span>
            ) : (
              <span>
                ¿Ya tienes cuenta?{' '}
                <button className="text-blue-600" onClick={() => setForm({ ...form, mode: "login" })}>
                  Inicia sesión
                </button>
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pensum de Ingeniería de Sistemas</h1>
        <button
          onClick={() => setUser(null)}
          className="text-sm text-blue-600 underline"
        >
          Cerrar sesión
        </button>
      </div>
      {semesters.map(s => (
        <div key={s} className="mb-6">
          <h2 className="font-semibold mb-2">Semestre {s}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {courses.filter(c => c.semester === s).map(c => (
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
