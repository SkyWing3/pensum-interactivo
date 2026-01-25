"use client";

import { Course, AreaMeta } from "../data/courses";
import CourseCard from "./CourseCard";

interface CourseGridProps {
  filteredCourses: Course[];
  semesters: number[];
  areas: AreaMeta[];
  statusFor: (id: string) => "pending" | "approved";
  isAvailable: (id: string) => boolean;
  statusLabel: (id: string) => string;
  toggleCourse: (id: string) => void;
  setSelectedId: (id: string) => void;
  selectedId: string | null;
}

export default function CourseGrid({
  filteredCourses,
  semesters,
  areas,
  statusFor,
  isAvailable,
  statusLabel,
  toggleCourse,
  setSelectedId,
  selectedId,
}: CourseGridProps) {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-slate-50/50 p-4 lg:p-6 rounded-3xl">
      {/* Mobile/Tablet View (Vertical Stack) */}
      <div className="flex flex-col gap-8 lg:hidden">
        {semesters.map((semester) => {
          const semesterCourses = filteredCourses.filter(
            (c) => c.semester === semester
          );
          if (semesterCourses.length === 0) return null;

          return (
            <div key={semester} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-[var(--color-heading)]">
                  Semestre {semester}
                </h3>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {semesterCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    status={statusFor(course.id)}
                    available={isAvailable(course.id)}
                    statusLabel={statusLabel(course.id)}
                    onToggle={() => toggleCourse(course.id)}
                    onSelect={() => setSelectedId(course.id)}
                    areaMeta={areas.find((a) => a.key === course.area)}
                    selected={selectedId === course.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View (Matrix) */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <div className="min-w-[1000px]">
          {/* Header */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-4 border-b border-slate-200 pb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            <div className="flex items-center justify-center">Sem</div>
            {areas.map((area) => (
              <div key={area.key} className="text-center">
                {area.short}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-4 pt-4">
            {semesters.map((semester) => (
              <div
                key={semester}
                className="grid grid-cols-[80px_repeat(7,1fr)] gap-4"
              >
                {/* Semester Label */}
                <div className="flex items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-400">
                  {semester}
                </div>

                {/* Area Cells */}
                {areas.map((area) => {
                  const list = filteredCourses.filter(
                    (c) => c.semester === semester && c.area === area.key
                  );
                  return (
                    <div key={area.key} className="flex flex-col gap-3">
                      {list.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          status={statusFor(course.id)}
                          available={isAvailable(course.id)}
                          statusLabel={statusLabel(course.id)}
                          onToggle={() => toggleCourse(course.id)}
                          onSelect={() => setSelectedId(course.id)}
                          areaMeta={area}
                          selected={selectedId === course.id}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {filteredCourses.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)]">
            <p className="text-lg font-medium">No se encontraron cursos</p>
            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
         </div>
      )}
    </div>
  );
}
