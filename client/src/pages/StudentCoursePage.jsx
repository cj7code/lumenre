// StudentCoursePage.jsx
// ------------------------------------------------------------
// Shows all modules in a selected course
// Route: /student/course/:courseId
// ------------------------------------------------------------

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

export default function StudentCoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // local progress tracking
  const progress = JSON.parse(localStorage.getItem("student-progress") || "{}");

  useEffect(() => {
    loadCourse();
    loadModules();
  }, [courseId]);

  // ------------------------------------------------------------
  // Load course info
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
  // Load modules for course
  // ------------------------------------------------------------
  const loadModules = async () => {
    try {
      const res = await api.get(`/api/student/courses/${courseId}/modules`);
      setModules(res.data || []);
    } catch (err) {
      console.error("Failed to load course modules", err);
    }
    setLoading(false);
  };

  if (loading) return <p className="p-6">Loading course…</p>;
  if (!course)
    return (
      <p className="p-6 text-red-600">
        Course not found. Please go back and select a course again.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">
          {course.title}
        </h1>
        <p className="text-sm text-slate-600">{course.code}</p>
      </header>

      {/* MODULE LIST */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>

        {modules.length === 0 ? (
          <p className="text-sm text-slate-600">No modules added yet.</p>
        ) : (
          <ul className="space-y-3">
            {modules.map((m) => (
              <li
                key={m._id}
                className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-800">{m.title}</h3>

                    <p className="text-xs text-slate-500 mt-1">
                      {progress[m._id] === "completed"
                        ? "Completed ✔"
                        : "Not started"}
                    </p>
                  </div>

                  <Link
                    to={`/student/module/${m._id}`}
                    className="text-primary underline text-sm"
                  >
                    View Module
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* BACK BUTTON */}
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
