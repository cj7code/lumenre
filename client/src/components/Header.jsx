// src/components/Header.jsx — Navigation bar with role-based links + improved dark mode
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  // 🌙 Manage Dark Mode State
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const navigate = useNavigate();
  const location = useLocation(); // Track current route for active link highlighting

  // -------------------------------------------------------
  // ✅ Load authentication info on mount
  // -------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token) setIsLoggedIn(true);

    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setRole(parsed.role); // Save user role
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  // -------------------------------------------------------
  // 🌙 Apply dark theme globally
  // -------------------------------------------------------
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // -------------------------------------------------------
  // 🚪 Logout handler
  // -------------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole(null);
    navigate("/login");
  };

  // -------------------------------------------------------
  // 🔥 Helper to highlight active links
  // -------------------------------------------------------
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#0a5275] dark:bg-slate-900 text-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex justify-between items-center py-5 px-4">

        {/* LOGO */}
        <Link to="/" className="text-xl font-bold tracking-wide">
          Lumenre
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center space-x-4 text-sm">

          {/* Home */}
          <Link
            to="/"
            className={`hover:text-teal-200 transition ${
              isActive("/") ? "underline font-semibold" : ""
            }`}
          >
            Home
          </Link>

          {/* Courses (Always Visible) */}
          <Link
            to="/courses"
            className={`hover:text-teal-200 transition ${
              isActive("/courses") ? "underline font-semibold" : ""
            }`}
          >
            Courses
          </Link>

          {/* Quizzes */}
          <Link
            to="/quiz/1"
            className={`hover:text-teal-200 transition ${
              isActive("/quiz/1") ? "underline font-semibold" : ""
            }`}
          >
            Quizzes
          </Link>

          {/* ---------------------------------------- */}
          {/* ROLE-BASED LINKS */}
          {/* ---------------------------------------- */}
          {role === "admin" && (
            <Link
              to="/admin"
              className={`hover:text-teal-200 transition ${
                isActive("/admin") ? "underline font-semibold" : ""
              }`}
            >
              Admin
            </Link>
          )}

          {role === "tutor" && (
            <Link
              to="/tutor"
              className={`hover:text-teal-200 transition ${
                isActive("/tutor") ? "underline font-semibold" : ""
              }`}
            >
              Tutor Dashboard
            </Link>
          )}

          {role === "student" && (
            <Link
              to="/student"
              className={`hover:text-teal-200 transition ${
                isActive("/student") ? "underline font-semibold" : ""
              }`}
            >
              Student Dashboard
            </Link>
          )}

          {/* ---------------------------------------- */}
          {/* AUTH BUTTONS */}
          {/* ---------------------------------------- */}
          {!isLoggedIn ? (
            <>
              <Link to="/signup" className="hover:text-teal-200 transition">
                Register
              </Link>
              <Link to="/login" className="hover:text-teal-200 transition">
                Login
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="ml-2 bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded text-white"
            >
              Logout
            </button>
          )}

          {/* ---------------------------------------- */}
          {/* 🌙 DARK MODE TOGGLE */}
          {/* ---------------------------------------- */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-2 bg-slate-200 dark:bg-slate-700 dark:text-slate-200 text-slate-800
                       px-3 py-1 rounded-full text-xs transition"
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>
    </header>
  );
}
