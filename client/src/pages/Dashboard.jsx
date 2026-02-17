// Dashboard.jsx – FIXED FOR STUDENT API
// -------------------------------------

import React, { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate, useLocation } from "react-router-dom";

// lucide-react icon imports
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import HeartPulse from "lucide-react/dist/esm/icons/heart-pulse";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";

const HERO_IMAGE_URL = "/images/health.jpg";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);

  const [openYear, setOpenYear] = useState(null);
  const [openSem, setOpenSem] = useState({});

  const nav = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  // ----------------------------------------------------------
  // 🔥 USE CORRECT STUDENT ENDPOINT
  // ----------------------------------------------------------
  useEffect(() => {
    api
      .get("/api/student/courses")
      .then((res) => setCourses(res.data || []))
      .catch((err) => console.error("Failed to fetch STUDENT courses", err));
  }, []);

  // Load logged-in user
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return;
    try {
      setUser(JSON.parse(u));
    } catch {
      /* ignore */
    }
  }, []);

  // ----------------------------------------------------------
  // GROUP COURSES BY YEAR → SEMESTER
  // ----------------------------------------------------------
  const grouped = {
    1: { 1: [], 2: [] },
    2: { 1: [], 2: [] },
    3: { 1: [], 2: [] },
  };

  courses.forEach((c) => {
    const y = Number(c.year);
    const s = Number(c.semester);
    if (grouped[y] && grouped[y][s]) grouped[y][s].push(c);
  });

  Object.keys(grouped).forEach((y) =>
    [1, 2].forEach((s) => {
      grouped[y][s].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", undefined, {
          sensitivity: "base",
        })
      );
    })
  );

  const totalCourses =
    grouped[1][1].length +
    grouped[1][2].length +
    grouped[2][1].length +
    grouped[2][2].length +
    grouped[3][1].length +
    grouped[3][2].length;

  // ----------------------------------------------------------
  // FIXED COURSE CLICK
  // Navigates to student module list page
  // ----------------------------------------------------------
  const openCourse = (courseId) => {
    if (!isLoggedIn) {
      return nav("/login", {
        state: {
          from: location,
          message: "Please log in to view course details.",
        },
      });
    }
    nav(`/student/course/${courseId}`);
  };

  // ----------------------------------------------------------
  // FIX DASHBOARD REDIRECTION
  // ----------------------------------------------------------
  const goToDashboard = () => {
    if (!user) return nav("/login");
    if (user.role === "admin") return nav("/admin");
    if (user.role === "tutor") return nav("/tutor");
    return nav("/student");
  };

  return (
    <>
      {/* HERO */}
      <section
        className="w-full bg-cover bg-center bg-no-repeat mt-10"
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
      >
        <div className="w-full bg-slate-950/60">
          <div className="w-full flex items-center justify-center py-10 md:py-12">
            <div className="text-center text-slate-50 space-y-4 max-w-2xl px-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium border border-white/30 backdrop-blur">
                <Sparkles className="w-4 h-4" />
                <span className="uppercase tracking-wide">
                  Lumenre • Nursing Education
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Welcome to Lumenre
              </h1>

              <p className="text-sm md:text-base text-slate-100/90">
                Your Nursing Companion
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap justify-center gap-3 pt-1">
                {user ? (
                  <button
                    onClick={goToDashboard}
                    className="inline-flex items-center justify-center rounded-full bg-white text-sky-900 font-semibold px-6 py-2.5 text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-transform"
                  >
                    <HeartPulse className="w-4 h-4 mr-2" />
                    Dashboard ({user.role})
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center rounded-full bg-white text-sky-900 font-semibold px-6 py-2.5 text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-transform"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-teal-400 text-white font-semibold px-6 py-2.5 text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-transform"
                    >
                      Join Lumenre
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-10 w-full">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Available Courses
              </h2>
              <p className="text-sm text-slate-600 mt-1 dark:text-white">
                Tap a year → a semester → choose a course.
              </p>
            </div>

            <div className="text-xs md:text-sm rounded-full bg-white border border-slate-200 px-4 py-1.5 shadow-sm">
              <span className="text-teal-700 font-semibold">
                {totalCourses}
              </span>{" "}
              <span className="text-slate-600">courses mapped</span>
            </div>
          </div>

          {/* Year buttons */}
          <section className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3].map((year) => {
                const count =
                  grouped[year][1].length + grouped[year][2].length;
                const active = openYear === year;

                return (
                  <button
                    key={year}
                    onClick={() => setOpenYear(active ? null : year)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-md border transform transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                      active
                        ? "bg-teal-600 text-white border-teal-500"
                        : "bg-white text-slate-800 border-slate-200"
                    }`}
                  >
                    <span>Year {year}</span>
                    <span className="text-xs opacity-80">({count})</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        active ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Semesters */}
            {openYear && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Semesters for Year {openYear}
                </p>

                <div className="flex flex-wrap gap-2">
                  {[1, 2].map((sem) => {
                    const active = openSem[sem];
                    const semCount = grouped[openYear][sem].length;

                    return (
                      <button
                        key={sem}
                        onClick={() =>
                          setOpenSem({ ...openSem, [sem]: !active })
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-md border transform transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                          active
                            ? "bg-rose-500 text-white border-rose-400"
                            : "bg-white text-slate-800 border-slate-200"
                        }`}
                      >
                        <span>Semester {sem}</span>
                        <span className="text-[10px] opacity-80">
                          ({semCount})
                        </span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            active ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Courses list */}
          {openYear && (
            <section className="space-y-4">
              {[1, 2].map((sem) => {
                if (!openSem[sem]) return null;

                const semCourses = grouped[openYear][sem];

                return (
                  <div key={sem} className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Year {openYear} • Semester {sem}
                    </h3>

                    {semCourses.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {semCourses.map((c) => (
                          <button
                            key={c._id}
                            onClick={() => openCourse(c._id)}
                            className="inline-flex flex-col items-start rounded-2xl px-4 py-3 min-w-[180px] max-w-xs text-left bg-white border border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-transform text-sm"
                          >
                            <span className="font-semibold text-slate-900 line-clamp-2">
                              {c.title}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-1">
                              {c.code || "Code pending"}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No courses available yet.
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
