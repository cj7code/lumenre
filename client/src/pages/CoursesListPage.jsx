// CoursesListPage.jsx
// ------------------------------------------------------------
// Flat course catalog for students
// - Uses dashboard-truth endpoint
// - All courses visible by default
// - Search filters live results
// ------------------------------------------------------------

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Search } from "lucide-react";

export default function CoursesListPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");

  // ----------------------------------------------------------
  // 🔥 SINGLE SOURCE OF TRUTH (same as Dashboard)
  // ----------------------------------------------------------
  useEffect(() => {
    api
      .get("/api/student/courses")
      .then((res) => setCourses(res.data || []))
      .catch((err) =>
        console.error("Failed to load student courses", err)
      );
  }, []);

  // ----------------------------------------------------------
  // SEARCH FILTER (non-destructive)
  // ----------------------------------------------------------
  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;

    const q = search.toLowerCase();

    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q)
    );
  }, [search, courses]);

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          All Courses
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Browse or search all available courses.
        </p>
      </header>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search by course title or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-xl bg-white shadow-sm focus:ring-teal-500 focus:border-teal-600"
        />
      </div>

      {/* EMPTY STATE */}
      {filteredCourses.length === 0 && (
        <p className="text-slate-500 italic">
          No courses match your search.
        </p>
      )}

      {/* COURSE GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => (
          <Link
            key={course._id}
            to={`/student/course/${course._id}`}
            className="
              block
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-4
              shadow-md
              hover:shadow-lg
              hover:-translate-y-0.5
              transition
            "
          >
            <h2 className="font-semibold text-slate-900 line-clamp-2">
              {course.title}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {course.code || "Code pending"}
            </p>

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>Year {course.year}</span>
              <span>Semester {course.semester}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
