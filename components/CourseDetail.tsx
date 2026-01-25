"use client";

import { useEffect, useRef } from "react";
import { AreaMeta, Course } from "../data/courses";

interface CourseDetailProps {
  course: Course | null;
  onClose: () => void;
  areas: AreaMeta[];
  status: "pending" | "approved";
  statusLabel: string;
  statusTone: string;
  available: boolean;
  onToggle: (id: string) => void;
  getCourseName: (id: string) => string;
  isKnownCourse: (id: string) => boolean;
  dependents: Course[];
  statusFor: (id: string) => string;
  isAvailable: (id: string) => boolean;
}

export default function CourseDetail({
  course,
  onClose,
  areas,
  status,
  statusLabel,
  statusTone,
  available,
  onToggle,
  getCourseName,
  isKnownCourse,
  dependents,
  statusFor,
  isAvailable,
}: CourseDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (course) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [course, onClose]);

  // Close when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!course) return null;

  const area = areas.find((a) => a.key === course.area);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="h-full w-full max-w-md bg-white p-6 shadow-2xl transition-transform duration-300 animate-in slide-in-from-right sm:border-l sm:border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            {course.id}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-heading)]">
            {course.name}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--color-muted)]">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: area?.soft, color: area?.tone }}
            >
              {area?.name}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Semestre {course.semester}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              UVE {course.uve}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-heading)]">
              Prerrequisitos
            </h3>
            <div className="mt-3 space-y-2">
              {course.prerequisites.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  No tiene prerrequisitos.
                </p>
              ) : (
                course.prerequisites.map((pr) => {
                  const prStatus = isKnownCourse(pr) ? statusFor(pr) : "unknown";
                  const prLabel =
                    prStatus === "approved"
                      ? "Aprobada"
                      : isKnownCourse(pr)
                      ? "Pendiente"
                      : "Externo";
                  const prColor =
                    prStatus === "approved"
                      ? "text-emerald-600"
                      : "text-amber-600";

                  return (
                    <div
                      key={pr}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm"
                    >
                      <span className="font-medium text-[var(--color-ink)]">
                        {getCourseName(pr)}
                      </span>
                      <span className={`text-xs ${prColor}`}>{prLabel}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-heading)]">
              Abre los siguientes cursos
            </h3>
            <div className="mt-3 space-y-2">
              {dependents.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  No es prerrequisito de otros cursos.
                </p>
              ) : (
                dependents.map((dep) => {
                  const depAvailable = isAvailable(dep.id);
                  return (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3 text-sm"
                    >
                      <span className="text-[var(--color-ink)]">{dep.name}</span>
                      {depAvailable && (
                        <span className="h-2 w-2 rounded-full bg-sky-500" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={() => {
              if (available || status === "approved") {
                onToggle(course.id);
                // Optional: Close on action? Maybe not to let them see the change.
              }
            }}
            disabled={!available && status !== "approved"}
            className={`w-full rounded-xl py-4 text-sm font-semibold shadow-sm transition-all ${
              status === "approved"
                ? "bg-white border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-slate-50"
                : available
                ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)] hover:shadow-md"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {status === "approved"
              ? "Marcar como pendiente"
              : available
              ? "Marcar como aprobada"
              : "Bloqueada por prerrequisitos"}
          </button>
        </div>
      </div>
    </div>
  );
}
