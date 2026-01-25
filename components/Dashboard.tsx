"use client";

import { useEffect, useMemo, useState } from "react";
import { areas, AreaKey, Course } from "../data/courses";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import CourseGrid from "./CourseGrid";
import CourseDetail from "./CourseDetail";

type CourseStatus = "pending" | "approved";

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [statuses, setStatuses] = useState<Record<string, CourseStatus>>({});
  const [query, setQuery] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<AreaKey[]>(
    areas.map((area) => area.key)
  );
  const [semesterFilter, setSemesterFilter] = useState<number | "all">("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data Fetching
  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then(setCourses);

    fetch("/api/user-courses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Record<string, CourseStatus>) => setStatuses(data));
  }, [token]);

  // Derived State
  const courseMap = useMemo(() => {
    return new Map(courses.map((course) => [course.id, course]));
  }, [courses]);

  const statusFor = (id: string): CourseStatus => statuses[id] || "pending";

  const isAvailable = (id: string) => {
    const course = courseMap.get(id);
    if (!course) return false;
    return course.prerequisites
      .filter((pr) => courseMap.has(pr))
      .every((pr) => statusFor(pr) === "approved");
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

  // Actions
  const toggleCourse = async (id: string) => {
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
    setSelectedAreas((prev) =>
      prev.includes(key) ? prev.filter((area) => area !== key) : [...prev, key]
    );
  };

  // Filtering
  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        course.name.toLowerCase().includes(normalizedQuery) ||
        course.id.toLowerCase().includes(normalizedQuery);
      const matchesArea = selectedAreas.includes(course.area);
      const matchesSemester =
        semesterFilter === "all" || course.semester === semesterFilter;
      const matchesAvailable = !onlyAvailable || isAvailable(course.id);
      const matchesApproved =
        !onlyApproved || statusFor(course.id) === "approved";
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

  // Stats
  const totalUve = courses.reduce((sum, course) => sum + course.uve, 0);
  const approvedUve = courses.reduce(
    (sum, course) =>
      statusFor(course.id) === "approved" ? sum + course.uve : sum,
    0
  );
  const approvedCount = courses.filter(
    (course) => statusFor(course.id) === "approved"
  ).length;
  const completion =
    totalUve > 0 ? Math.round((approvedUve / totalUve) * 100) : 0;
  const semesters = Array.from(new Set(courses.map((c) => c.semester))).sort();

  const selectedCourse = selectedId ? courseMap.get(selectedId) || null : null;
  const dependents = selectedCourse
    ? courses.filter((c) => c.prerequisites.includes(selectedCourse.id))
    : [];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-ink)] flex flex-col">
      <NavBar
        approvedUve={approvedUve}
        totalUve={totalUve}
        completion={completion}
        onLogout={onLogout}
        onMenuToggle={() => setIsSidebarOpen(true)}
      />

      <main className="flex flex-1 overflow-hidden relative">
        <Sidebar
          query={query}
          setQuery={setQuery}
          onlyAvailable={onlyAvailable}
          setOnlyAvailable={setOnlyAvailable}
          onlyApproved={onlyApproved}
          setOnlyApproved={setOnlyApproved}
          selectedAreas={selectedAreas}
          toggleArea={toggleArea}
          semesterFilter={semesterFilter}
          setSemesterFilter={setSemesterFilter}
          courses={courses}
          approvedCount={approvedCount}
          approvedUve={approvedUve}
          totalUve={totalUve}
          completion={completion}
          semesters={semesters}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 min-w-0 h-full p-4 lg:p-6">
          <CourseGrid
            filteredCourses={filteredCourses}
            semesters={semesters}
            areas={areas}
            statusFor={statusFor}
            isAvailable={isAvailable}
            statusLabel={statusLabel}
            toggleCourse={toggleCourse}
            setSelectedId={(id) => {
               setSelectedId(id);
               // On mobile, maybe we don't want to auto-scroll or anything, handled by Detail component
            }}
            selectedId={selectedId}
          />
        </div>
      </main>

      <CourseDetail
        course={selectedCourse}
        onClose={() => setSelectedId(null)}
        areas={areas}
        status={selectedCourse ? statusFor(selectedCourse.id) : "pending"}
        statusLabel={selectedCourse ? statusLabel(selectedCourse.id) : ""}
        statusTone={selectedCourse ? statusTone(selectedCourse.id) : ""}
        available={selectedCourse ? isAvailable(selectedCourse.id) : false}
        onToggle={toggleCourse}
        getCourseName={(id) => courseMap.get(id)?.name || id}
        isKnownCourse={(id) => courseMap.has(id)}
        dependents={dependents}
        statusFor={statusFor}
        isAvailable={isAvailable}
      />
    </div>
  );
}
