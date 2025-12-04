// src/pages/QuizListPage.jsx
// -------------------------------------------------------------
// Displays all quizzes depending on user role:
//   • Student  → show quizzes across their courses/modules
//   • Admin    → show all quizzes in all modules
//   • Tutor    → show module quizzes they manage
//
// Mobile-friendly, clean UI, and SAFE routes.
// -------------------------------------------------------------

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role || "student"; // default fallback

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    try {
      setLoading(true);

      if (role === "student") {
        await loadStudentQuizzes();
      } else {
        await loadAdminTutorQuizzes();
      }
    } catch (err) {
      console.error("QUIZ LIST LOAD ERROR:", err);
    }
    setLoading(false);
  }

  // ----------------------------------------------------------
  // STUDENT QUIZ LOADING
  // Load all courses → modules → quizzes
  // ----------------------------------------------------------
  async function loadStudentQuizzes() {
    const r = await api.get("/api/student/courses");
    const courses = r.data || [];

    let collected = [];

    for (const course of courses) {
      const m = await api.get(`/api/student/courses/${course._id}/modules`);
      const modules = m.data || [];

      for (const mod of modules) {
        if (Array.isArray(mod.quizzes)) {
          mod.quizzes.forEach((q) =>
            collected.push({
              ...q,
              moduleTitle: mod.title,
              courseTitle: course.title,
            })
          );
        }
      }
    }

    setQuizzes(collected);
  }

  // ----------------------------------------------------------
  // ADMIN / TUTOR QUIZ LOADING
  // Uses admin routes
  // ----------------------------------------------------------
  async function loadAdminTutorQuizzes() {
    const r = await api.get("/api/courses");
    const courses = r.data || [];

    let collected = [];

    for (const course of courses) {
      const m = await api.get(`/api/courses/${course._id}`);
      const modules = m.data?.modules || [];

      for (const mod of modules) {
        if (Array.isArray(mod.quizzes)) {
          mod.quizzes.forEach((q) =>
            collected.push({
              ...q,
              moduleTitle: mod.title,
              courseTitle: course.title,
            })
          );
        }
      }
    }

    setQuizzes(collected);
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  if (loading) return <div className="p-6">Loading quizzes…</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">
        📝 Available Quizzes
      </h1>

      {quizzes.length === 0 && (
        <p className="text-slate-600 italic">No quizzes available.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((q) => (
          <div
            key={q._id}
            className="bg-white shadow rounded-xl border p-4 space-y-2 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-slate-800 text-lg">
              {q.title || "Untitled Quiz"}
            </h2>

            <p className="text-xs text-slate-500">
              Course: <span className="font-medium">{q.courseTitle}</span>
            </p>
            <p className="text-xs text-slate-500">
              Module: <span className="font-medium">{q.moduleTitle}</span>
            </p>

            <div className="pt-2">
              <Link
                to={`/student/quiz/${q._id}`}
                className="inline-block text-sm bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 transition"
              >
                Start Quiz →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
