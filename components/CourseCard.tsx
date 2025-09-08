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
      ? "bg-green-500 text-white"
      : available
      ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
      : "bg-gray-200 text-gray-600";
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${base}`}
      onClick={toggle}
    >
      <p className="font-semibold">{course.name}</p>
      <p className="text-xs">{course.id}</p>
    </motion.div>
  );
}
