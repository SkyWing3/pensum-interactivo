"use client";

import { areas, AreaKey, Course } from "../data/courses";

interface SidebarProps {
  query: string;
  setQuery: (q: string) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (v: boolean) => void;
  onlyApproved: boolean;
  setOnlyApproved: (v: boolean) => void;
  selectedAreas: AreaKey[];
  toggleArea: (key: AreaKey) => void;
  semesterFilter: number | "all";
  setSemesterFilter: (s: number | "all") => void;
  courses: Course[];
  approvedCount: number;
  approvedUve: number;
  totalUve: number;
  completion: number;
  semesters: number[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  query,
  setQuery,
  onlyAvailable,
  setOnlyAvailable,
  onlyApproved,
  setOnlyApproved,
  selectedAreas,
  toggleArea,
  semesterFilter,
  setSemesterFilter,
  courses,
  approvedCount,
  approvedUve,
  totalUve,
  completion,
  semesters,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform bg-white/90 p-6 shadow-xl backdrop-blur transition-transform duration-300 lg:static lg:w-[300px] lg:shrink-0 lg:transform-none lg:bg-transparent lg:shadow-none lg:p-0 lg:border-r lg:border-slate-200/70 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col gap-6 overflow-y-auto pb-6">
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Filtros
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[var(--color-muted)] hover:bg-slate-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[var(--color-heading)]">
                Buscar
              </h2>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Código o nombre"
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-[var(--color-muted)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-[var(--color-accent)]"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                  />
                  Solo disponibles
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-[var(--color-accent)]"
                    checked={onlyApproved}
                    onChange={(e) => setOnlyApproved(e.target.checked)}
                  />
                  Solo aprobadas
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[var(--color-heading)]">
                Áreas
              </h2>
              <div className="mt-4 space-y-2">
                {areas.map((area) => (
                  <button
                    key={area.key}
                    onClick={() => toggleArea(area.key)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                      selectedAreas.includes(area.key)
                        ? "border-transparent bg-slate-800 text-white"
                        : "border-slate-200 bg-white text-[var(--color-ink)] hover:bg-slate-50"
                    }`}
                  >
                    <span>{area.name}</span>
                    <span
                      className={`text-[10px] ${
                        selectedAreas.includes(area.key)
                          ? "opacity-100"
                          : "opacity-50"
                      }`}
                    >
                      {courses.filter((c) => c.area === area.key).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[var(--color-heading)]">
                Semestre
              </h2>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                <button
                  className={`col-span-4 rounded-lg border px-2 py-1.5 ${
                    semesterFilter === "all"
                      ? "border-transparent bg-[var(--color-accent)] text-white"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                  onClick={() => setSemesterFilter("all")}
                >
                  Todos
                </button>
                {semesters.map((sem) => (
                  <button
                    key={sem}
                    className={`rounded-lg border px-2 py-1.5 ${
                      semesterFilter === sem
                        ? "border-transparent bg-[var(--color-accent)] text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => setSemesterFilter(sem)}
                  >
                    {sem}º
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[var(--color-heading)]">
                Progreso
              </h2>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-muted)]">Materias</span>
                  <span className="font-semibold text-[var(--color-heading)]">
                    {approvedCount} / {courses.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-muted)]">UVEs</span>
                  <span className="font-semibold text-[var(--color-heading)]">
                    {approvedUve} / {totalUve}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
