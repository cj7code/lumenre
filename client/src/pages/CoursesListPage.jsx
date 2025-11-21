// CoursesListPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Search, BookOpen, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function CoursesListPage() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [semester, setSemester] = useState("all");

  // Load courses on mount
  useEffect(() => {
    api
      .get("/courses")
      .then((res) => {
        setCourses(res.data);
        setFiltered(res.data);
      })
      .catch(() => {});
  }, []);

  // Apply search and filters
  useEffect(() => {
    let list = [...courses];

    if (search.trim() !== "") {
      list = list.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (year !== "all") {
      list = list.filter((c) => c.year === Number(year));
    }

    if (semester !== "all") {
      list = list.filter((c) => c.semester === Number(semester));
    }

    setFiltered(list);
  }, [search, year, semester, courses]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        📘 Courses & Modules
      </h1>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">

        {/* Search */}
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-xl bg-white shadow-sm focus:ring-teal-500 focus:border-teal-600"
          />
        </div>

        {/* Year Filter */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border bg-white shadow-sm px-3 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-600"
        >
          <option value="all">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
        </select>

        {/* Semester Filter */}
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="border bg-white shadow-sm px-3 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-600"
        >
          <option value="all">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <p className="text-slate-500 text-center mt-10">
          No courses found — try adjusting filters.
        </p>
      )}

      {/* Course Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={`/courses/${course._id}`}
              className="block bg-white p-4 rounded-2xl shadow hover:shadow-md hover:bg-slate-50 transition border border-slate-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-teal-600" size={20} />
                <h2 className="font-semibold text-slate-800 text-lg">
                  {course.title}
                </h2>
              </div>

              <p className="text-sm text-slate-600">{course.code}</p>

              <div className="mt-3 flex justify-between text-sm text-slate-500">
                <span>Year {course.year}</span>
                <span>Semester {course.semester}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
