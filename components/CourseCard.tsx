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
      ? "border-emerald-200 bg-emerald-50"
      : available
      ? "border-sky-200 bg-sky-50"
      : "border-slate-200 bg-white";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`w-full text-left transition ${
        selected ? "ring-2 ring-[var(--color-accent)]" : ""
      }`}
    >
      <div
        className={`rounded-2xl border p-4 shadow-sm ${statusStyle}`}
        style={{ borderTopColor: areaMeta?.tone, borderTopWidth: "3px" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)]">
              {course.id}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-heading)]">
              {course.name}
            </p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted)]">
            UVE {course.uve}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px]">
          <span
            className="rounded-full px-2.5 py-0.5"
            style={{ background: areaMeta?.soft, color: areaMeta?.tone }}
          >
            {areaMeta?.short}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 ${
              status === "approved"
                ? "bg-emerald-100 text-emerald-700"
                : available
                ? "bg-sky-100 text-sky-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            if (available || status === "approved") onToggle();
          }}
          disabled={!available && status !== "approved"}
          className={`mt-4 w-full rounded-lg py-2 text-xs font-semibold transition ${
            available || status === "approved"
              ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)]"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {status === "approved" ? "Marcar pendiente" : "Aprobar"}
        </button>
      </div>
    </div>
  );
}
