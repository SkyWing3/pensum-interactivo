"use client";

import { useEffect, useMemo, useState } from "react";
import CourseCard from "../components/CourseCard";
import { areas, AreaKey, Course } from "../data/courses";

type CourseStatus = "pending" | "approved";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [statuses, setStatuses] = useState<Record<string, CourseStatus>>({});
  const [form, setForm] = useState({ email: "", password: "", mode: "login" });
  const [query, setQuery] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<AreaKey[]>(
    areas.map(area => area.key)
  );
  const [semesterFilter, setSemesterFilter] = useState<number | "all">("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token) {
      fetch("/api/courses")
        .then(res => res.json())
        .then(setCourses);
      fetch("/api/user-courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then((data: Record<string, CourseStatus>) => setStatuses(data));
    }
  }, [token]);

  const courseMap = useMemo(() => {
    return new Map(courses.map(course => [course.id, course]));
  }, [courses]);

  const statusFor = (id: string): CourseStatus => statuses[id] || "pending";

  const isAvailable = (id: string) => {
    const course = courseMap.get(id);
    if (!course) return false;
    return course.prerequisites
      .filter(pr => courseMap.has(pr))
      .every(pr => statusFor(pr) === "approved");
  };

  const statusLabel = (id: string) => {
    const status = statusFor(id);
    if (status === "approved") return "Aprobada";
    return isAvailable(id) ? "Disponible" : "Bloqueada";
  };

  const statusTone = (id: string) => {
    const status = statusFor(id);
    if (status === "approved") return "bg-emerald-100 text-emerald-800";
    return isAvailable(id)
      ? "bg-sky-100 text-sky-800"
      : "bg-slate-100 text-slate-600";
  };

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

  const toggleArea = (key: AreaKey) => {
    setSelectedAreas(prev =>
      prev.includes(key) ? prev.filter(area => area !== key) : [...prev, key]
    );
  };

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courses.filter(course => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        course.name.toLowerCase().includes(normalizedQuery) ||
        course.id.toLowerCase().includes(normalizedQuery);
      const matchesArea = selectedAreas.includes(course.area);
      const matchesSemester =
        semesterFilter === "all" || course.semester === semesterFilter;
      const matchesAvailable = !onlyAvailable || isAvailable(course.id);
      const matchesApproved = !onlyApproved || statusFor(course.id) === "approved";
      return (
        matchesQuery &&
        matchesArea &&
        matchesSemester &&
        matchesAvailable &&
        matchesApproved
      );
    });
  }, [
    courses,
    query,
    selectedAreas,
    semesterFilter,
    onlyAvailable,
    onlyApproved,
    courseMap,
    statuses,
  ]);

  const totalUve = courses.reduce((sum, course) => sum + course.uve, 0);
  const approvedUve = courses.reduce(
    (sum, course) => (statusFor(course.id) === "approved" ? sum + course.uve : sum),
    0
  );
  const approvedCount = courses.filter(course => statusFor(course.id) === "approved").length;
  const completion = totalUve > 0 ? Math.round((approvedUve / totalUve) * 100) : 0;

  const semesters = Array.from(new Set(courses.map(c => c.semester))).sort();

  const selectedCourse = selectedId ? courseMap.get(selectedId) : null;

  const getCourseName = (id: string) => courseMap.get(id)?.name || id;
  const isKnownCourse = (id: string) => courseMap.has(id);

  const dependents = selectedCourse
    ? courses.filter(course => course.prerequisites.includes(selectedCourse.id))
    : [];

  if (!token) {
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
              Planifica tu avance por semestres, controla UVE aprobadas y visualiza
              requisitos en una sola vista.
            </p>
            <div className="grid gap-4">
              {[
                "Seguimiento por área académica",
                "Estado de prerrequisitos en tiempo real",
                "Resumen de UVE aprobadas y pendientes",
                "Panel de control para próximos cursos",
              ].map(item => (
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
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button
                onClick={handleAuth}
                className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-semibold text-white shadow hover:bg-[var(--color-accent-strong)]"
              >
                {form.mode === "login" ? "Ingresar" : "Registrarse"}
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
                {form.mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                <button
                  className="font-semibold text-[var(--color-heading)]"
                  onClick={() =>
                    setForm({ ...form, mode: form.mode === "login" ? "register" : "login" })
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

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-ink)]">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
              Universidad Católica Boliviana
            </p>
            <h1 className="text-2xl font-semibold text-[var(--color-heading)]">
              Carrera de Ingeniería de Sistemas · Malla Curricular 2026
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Acreditada por el Instituto Internacional para el Aseguramiento de la Calidad
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
              <div className="text-[var(--color-muted)]">Avance</div>
              <div className="text-lg font-semibold text-[var(--color-heading)]">
                {approvedUve} / {totalUve} UVE · {completion}%
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setToken(null);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-[var(--color-muted)] hover:border-slate-300"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1480px] gap-8 px-6 py-10 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--color-heading)]">Buscar</h2>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Código o nombre"
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--color-muted)]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={e => setOnlyAvailable(e.target.checked)}
                />
                Solo disponibles
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyApproved}
                  onChange={e => setOnlyApproved(e.target.checked)}
                />
                Solo aprobadas
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--color-heading)]">Filtrar por área</h2>
            <div className="mt-4 space-y-2">
              {areas.map(area => (
                <button
                  key={area.key}
                  onClick={() => toggleArea(area.key)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selectedAreas.includes(area.key)
                      ? "border-transparent bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-[var(--color-ink)]"
                  }`}
                >
                  <span>{area.name}</span>
                  <span className="text-xs opacity-70">
                    {courses.filter(course => course.area === area.key).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--color-heading)]">Semestre</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <button
                className={`rounded-lg border px-2 py-1 ${
                  semesterFilter === "all" ? "border-transparent bg-[var(--color-accent)] text-white" : "border-slate-200"
                }`}
                onClick={() => setSemesterFilter("all")}
              >
                Todos
              </button>
              {semesters.map(sem => (
                <button
                  key={sem}
                  className={`rounded-lg border px-2 py-1 ${
                    semesterFilter === sem
                      ? "border-transparent bg-[var(--color-accent)] text-white"
                      : "border-slate-200"
                  }`}
                  onClick={() => setSemesterFilter(sem)}
                >
                  {sem}º
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--color-heading)]">Resumen</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted)]">Cursos aprobados</span>
                <span className="font-semibold text-[var(--color-heading)]">
                  {approvedCount} / {courses.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted)]">UVE aprobadas</span>
                <span className="font-semibold text-[var(--color-heading)]">
                  {approvedUve} / {totalUve}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted)]">Avance total</span>
                <span className="font-semibold text-[var(--color-heading)]">{completion}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)]"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--color-heading)]">Leyenda</h2>
            <div className="mt-4 space-y-2 text-xs text-[var(--color-muted)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Aprobada
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> Disponible
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> Bloqueada
              </div>
            </div>
          </div>

          {selectedCourse && (
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {selectedCourse.id}
                  </p>
                  <h3 className="text-lg font-semibold text-[var(--color-heading)]">
                    {selectedCourse.name}
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  UVE {selectedCourse.uve}
                </span>
              </div>
              <div className="mt-4 text-sm text-[var(--color-muted)]">
                <p>
                  Área: {areas.find(area => area.key === selectedCourse.area)?.name}
                </p>
                <p>Semestre: {selectedCourse.semester}</p>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Prerrequisitos
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  {selectedCourse.prerequisites.length === 0 ? (
                    <span className="text-[var(--color-muted)]">Ninguno</span>
                  ) : (
                    selectedCourse.prerequisites.map(pr => (
                      <div key={pr} className="flex items-center justify-between">
                        <span>{getCourseName(pr)}</span>
                        {isKnownCourse(pr) ? (
                          <span className={`rounded-full px-2 py-0.5 text-xs ${statusTone(pr)}`}>
                            {statusLabel(pr)}
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            Externo
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Cursos dependientes
                </p>
                <div className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
                  {dependents.length === 0 ? (
                    <span>No hay cursos posteriores directos.</span>
                  ) : (
                    dependents.map(course => <div key={course.id}>{course.name}</div>)
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleCourse(selectedCourse.id)}
                disabled={!isAvailable(selectedCourse.id)}
                className={`mt-5 w-full rounded-lg py-2 text-sm font-semibold transition ${
                  isAvailable(selectedCourse.id)
                    ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)]"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {statusFor(selectedCourse.id) === "approved"
                  ? "Marcar como pendiente"
                  : "Marcar como aprobada"}
              </button>
            </div>
          )}
        </aside>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80">
            <div className="grid min-w-[1200px] grid-cols-[140px_repeat(7,minmax(190px,1fr))] border-b border-slate-200/80 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              <div className="px-5 py-4">Semestre</div>
              {areas.map(area => (
                <div key={area.key} className="px-5 py-4">
                  {area.short}
                </div>
              ))}
            </div>
            <div className="max-h-[72vh] overflow-auto">
              {semesters.map(semester => (
                <div
                  key={semester}
                  className="grid min-w-[1200px] grid-cols-[140px_repeat(7,minmax(190px,1fr))] border-b border-slate-100"
                >
                  <div className="flex flex-col justify-center gap-2 border-r border-slate-100 px-5 py-8 text-sm font-semibold text-[var(--color-heading)]">
                    <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      Sem
                    </span>
                    {semester}
                  </div>
                  {areas.map(area => {
                    const list = filteredCourses.filter(
                      course => course.semester === semester && course.area === area.key
                    );
                    return (
                      <div key={area.key} className="px-5 py-6">
                        <div className="space-y-4">
                          {list.length === 0 ? (
                            <div className="text-xs text-slate-300">Sin cursos</div>
                          ) : (
                            list.map(course => (
                              <CourseCard
                                key={course.id}
                                course={course}
                                status={statusFor(course.id)}
                                available={isAvailable(course.id)}
                                statusLabel={statusLabel(course.id)}
                                onToggle={() => toggleCourse(course.id)}
                                onSelect={() => setSelectedId(course.id)}
                                areaMeta={areas.find(meta => meta.key === course.area)}
                                selected={selectedId === course.id}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {filteredCourses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-[var(--color-muted)]">
              No hay cursos que coincidan con los filtros.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
