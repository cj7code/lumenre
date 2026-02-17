// StudentCoursePage.jsx
// ------------------------------------------------------------
// Shows all modules in a selected course
// Route: /student/course/:courseId
//
// UX improvement:
// - Entire module card is clickable
// - No separate "View Module" button
// ------------------------------------------------------------

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

export default function StudentCoursePage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local progress tracking (simple client-side persistence)
  const progress = JSON.parse(
    localStorage.getItem("student-progress") || "{}"
  );

  useEffect(() => {
    loadCourse();
    loadModules();
  }, [courseId]);

  // ------------------------------------------------------------
  // Load course information
  // ------------------------------------------------------------
  const loadCourse = async () => {
    try {
      const res = await api.get("/api/student/courses");
      const found = res.data.find((c) => c._id === courseId);
      setCourse(found || null);
    } catch (err) {
      console.error("Failed to load course", err);
    }
  };

  // ------------------------------------------------------------
  // Load modules belonging to the course
  // ------------------------------------------------------------
  const loadModules = async () => {
    try {
      const res = await api.get(
        `/api/student/courses/${courseId}/modules`
      );
      setModules(res.data || []);
    } catch (err) {
      console.error("Failed to load course modules", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Guard states
  // ------------------------------------------------------------
  if (loading) {
    return <p className="p-6">Loading course…</p>;
  }

  if (!course) {
    return (
      <p className="p-6 text-red-600">
        Course not found. Please go back and select a course again.
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* ====================================================== */}
      {/* COURSE HEADER */}
      {/* ====================================================== */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">
          {course.title}
        </h1>
        <p className="text-sm text-slate-600">{course.code}</p>
      </header>

      {/* ====================================================== */}
      {/* MODULE LIST */}
      {/* ====================================================== */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>

        {modules.length === 0 ? (
          <p className="text-sm text-slate-600">
            No modules added yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {modules.map((m) => {
              const isCompleted =
                progress[m._id] === "completed";

              return (
                // ------------------------------------------------
                // Entire module card is wrapped in <Link>
                // This makes the whole card clickable
                // ------------------------------------------------
                <li key={m._id}>
                  <Link
                    to={`/student/module/${m._id}`}
                    className="
                      block
                      border
                      rounded-lg
                      p-4
                      bg-white
                      shadow
                      transition
                      hover:shadow-md
                      hover:border-primary
                      focus:outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {m.title}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          {isCompleted
                            ? "Completed ✔"
                            : "Not started"}
                        </p>
                      </div>

                      {/* 
                        Visual affordance to show clickability.
                        Not a button, purely informational.
                      */}
                      <span className="text-sm text-primary">
                        Open →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ====================================================== */}
      {/* BACK TO DASHBOARD */}
      {/* ====================================================== */}
      <div className="pt-4">
        <Link
          to="/"
          className="text-slate-600 underline text-sm hover:text-slate-900"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
