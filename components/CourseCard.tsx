"use client";

import { Course, AreaMeta } from "../data/courses";

interface Props {
  course: Course;
  status: "pending" | "approved";
  available: boolean;
  statusLabel: string;
  onToggle: () => void;
  onSelect: () => void;
  areaMeta?: AreaMeta;
  selected: boolean;
}

export default function CourseCard({
  course,
  status,
  available,
  statusLabel,
  onToggle,
  onSelect,
  areaMeta,
  selected,
}: Props) {
  const statusStyle =
    status === "approved"
      ? "border-emerald-200 bg-emerald-50/50"
      : available
      ? "border-sky-200 bg-white"
      : "border-slate-100 bg-slate-50/50 opacity-80";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`group w-full text-left transition-all duration-200 ${
        selected ? "ring-2 ring-[var(--color-accent)] ring-offset-2" : "hover:-translate-y-0.5"
      }`}
    >
      <div
        className={`h-full rounded-xl border p-3.5 transition-colors ${statusStyle}`}
        style={{ borderTopColor: areaMeta?.tone, borderTopWidth: "3px" }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
              {course.id}
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-tight text-[var(--color-heading)]">
              {course.name}
            </p>
          </div>
          {course.uve > 0 && (
            <span className="shrink-0 rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-muted)] border border-black/5">
              {course.uve} UVE
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2 pt-2 mt-auto">
             <div className="flex items-center gap-1.5 overflow-hidden">
                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: areaMeta?.tone }} />
                <span className="truncate text-[10px] text-[var(--color-muted)] font-medium">
                    {areaMeta?.short}
                </span>
             </div>
             
             {status === "approved" && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Aprobada" />
             )}
             {available && status !== "approved" && (
                <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0 animate-pulse" title="Disponible" />
             )}
        </div>
      </div>
    </div>
  );
}
