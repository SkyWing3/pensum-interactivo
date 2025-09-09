"use client";

import { Course } from "../data/courses";
import { motion } from "framer-motion";

interface Props {
  course: Course;
  status: "pending" | "approved";
  available: boolean;
  toggle: () => void;
}

export default function CourseCard({ course, status, available, toggle }: Props) {
  const base =
    status === "approved"
      ? "bg-[var(--color-primary)] text-white"
      : available
      ? "bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text)]"
      : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed";
  return (
    <motion.div
      whileHover={available ? { scale: 1.05 } : undefined}
      whileTap={available ? { scale: 0.95 } : undefined}
      className={`p-4 rounded-lg shadow ${base}`}
      onClick={available ? toggle : undefined}
    >
      <p className="font-semibold">{course.name}</p>
      <p className="text-xs">{course.id}</p>
    </motion.div>
  );
}
