// StudentDashboard.jsx
// ---------------------------------------------------------------------------
// Student home page:
//   ✓ Lists all courses
//   ✓ Clicking a course shows modules
//   ✓ Clicking a module opens StudentModuleView
//   ✓ Tracks progress (client-side, backend optional)
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(() => {
    // Local storage progress tracking
    try {
      return JSON.parse(localStorage.getItem("student-progress")) || {};
    } catch {
      return {};
    }
  });

  // Save progress to local storage
  const saveProgress = (modId) => {
    const newProg = { ...progress, [modId]: "completed" };
    setProgress(newProg);
    localStorage.setItem("student-progress", JSON.stringify(newProg));
  };

  // Load all courses
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get("/api/student/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load courses");
    }
    setLoading(false);
  };

  const loadModules = async (courseId) => {
    setModules([]);
    setSelectedCourse(courseId);
    try {
      const res = await api.get(`/api/student/courses/${courseId}/modules`);
      setModules(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load modules");
    }
  };

  if (loading) return <p className="p-6">Loading dashboard…</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* --------------------------- HEADER --------------------------- */}
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-slate-600 text-sm">
          Welcome! Choose your course to begin learning.
        </p>
      </div>

      {/* --------------------------- COURSES --------------------------- */}
      <section className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Courses</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <button
              key={course._id}
              onClick={() => loadModules(course._id)}
              className={`border p-4 rounded text-left shadow-sm hover:shadow-md transition ${
                selectedCourse === course._id ? "border-primary" : ""
              }`}
            >
              <h3 className="font-bold">{course.title}</h3>
              <p className="text-xs text-slate-600">{course.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* --------------------------- MODULES --------------------------- */}
      {selectedCourse && (
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">
            Modules in {courses.find((c) => c._id === selectedCourse)?.title}
          </h2>

          {modules.length === 0 ? (
            <p className="text-sm text-slate-600">No modules yet.</p>
          ) : (
            <ul className="space-y-3">
              {modules.map((mod) => (
                <li
                  key={mod._id}
                  className="p-3 border rounded flex justify-between items-center hover:bg-slate-50"
                >
                  <div>
                    <h3 className="font-bold">{mod.title}</h3>
                    <p className="text-xs text-slate-600">
                      {progress[mod._id] === "completed"
                        ? "Completed ✔"
                        : "Not started"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/student/module/${mod._id}`}
                      className="text-primary underline text-sm"
                    >
                      View
                    </Link>

                    {progress[mod._id] !== "completed" && (
                      <button
                        onClick={() => saveProgress(mod._id)}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
