// Polished Landing Page — Year → Semesters → Courses
// Dashboard.jsx

import React, { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);

  // UI states
  const [openYear, setOpenYear] = useState(null);
  const [openSem, setOpenSem] = useState({});
  
  const nav = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem("token");

  // Fetch courses
  useEffect(() => {
    api
      .get("/courses")
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Failed to fetch courses", err));
  }, []);

  // Get user
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
  }, []);

  // Year → Semester → Courses grouping
  const grouped = {
    1: { 1: [], 2: [] },
    2: { 1: [], 2: [] },
    3: { 1: [], 2: [] },
  };

  courses.forEach((c) => {
    const y = Number(c.year);
    const s = Number(c.semester);
    if (grouped[y]) grouped[y][s].push(c);
  });

  // Handle course click
  const openCourse = (id) => {
    if (!isLoggedIn) {
      return nav("/login", {
        state: {
          from: location,
          message: "Please log in to view course details.",
        },
      });
    }
    nav(`/course/${id}`);
  };

  // Role-based dashboard
  const goToDashboard = () => {
    if (!user) return nav("/login");
    if (user.role === "admin") nav("/admin");
    else if (user.role === "tutor") nav("/tutor");
    else nav("/student");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HERO */}
      <section className="bg-[#0a5275] text-white rounded-lg p-10 mb-10 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Diploma in Nursing</h1>
        <p className="text-lg opacity-90">
          Explore your 3-year professional curriculum with easy navigation.
        </p>

        <div className="mt-6 space-x-2">
          {user ? (
            <button
              onClick={goToDashboard}
              className="bg-white text-[#0a5275] font-semibold px-5 py-2 rounded hover:bg-gray-100"
            >
              Go to your dashboard ({user.role})
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-[#0a5275] font-semibold px-5 py-2 rounded hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-teal-600 text-white font-semibold px-5 py-2 rounded hover:bg-teal-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </section>

      {/* AVAILABLE COURSES STRUCTURED VIEW */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Available Courses</h2>

        {/* Year Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((year) => (
            <div
              key={year}
              className="bg-white rounded shadow p-6 border hover:shadow-lg cursor-pointer transition"
              onClick={() => setOpenYear(openYear === year ? null : year)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#0a5275]">Year {year}</h3>
                <ChevronDown
                  className={`transition ${
                    openYear === year ? "rotate-180" : ""
                  }`}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {grouped[year][1].length + grouped[year][2].length} courses
              </p>
            </div>
          ))}
        </div>

        {/* Year Expanded Section */}
        {openYear && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow border">
            <h3 className="text-xl font-bold mb-4 text-[#0a5275]">
              Year {openYear}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((sem) => (
                <div
                  key={sem}
                  className="bg-slate-50 rounded p-4 border dark:bg-slate-800"
                >
                  <button
                    onClick={() =>
                      setOpenSem({
                        ...openSem,
                        [sem]: !openSem[sem],
                      })
                    }
                    className="w-full flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-lg font-semibold">
                        Semester {sem}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {grouped[openYear][sem].length} courses
                      </p>
                    </div>
                    <ChevronDown
                      className={`transition ${
                        openSem[sem] ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openSem[sem] && (
                    <div className="mt-4 space-y-3">
                      {grouped[openYear][sem].map((c) => (
                        <div
                          key={c._id}
                          className="bg-white p-4 rounded border shadow-sm cursor-pointer hover:shadow-md"
                          onClick={() => openCourse(c._id)}
                        >
                          <h5 className="font-semibold text-[#0a5275]">
                            {c.title}
                          </h5>
                          <p className="text-sm text-gray-500">
                            {c.code || ""}
                          </p>
                        </div>
                      ))}

                      {grouped[openYear][sem].length === 0 && (
                        <p className="text-sm text-gray-500">
                          No courses available in this semester.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
