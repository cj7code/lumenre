// Header.jsx — Navigation bar with role-based links
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  // Track login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Track user role
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // ✅ Check localStorage for login info on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token) setIsLoggedIn(true);

    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setRole(parsed.role); // Store role (admin, tutor, student)
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole(null);
    navigate("/login");
  };

  return (
    <header className="bg-[#0a5275] text-white shadow-md sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex justify-between items-center p-4">
        {/* App name / Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide">
          Lumenre
        </Link>

        {/* Navigation links */}
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:text-teal-200 transition">Home</Link>
          <Link to="/courses" className="hover:text-teal-200 transition">Courses</Link>
          <Link to="/quiz/1" className="hover:text-teal-200 transition">Quizzes</Link>

          {/* Role-based links */}
          {role === "admin" && (
            <Link to="/admin" className="hover:text-teal-200 transition">Admin</Link>
          )}
          {role === "tutor" && (
            <Link to="/tutor" className="hover:text-teal-200 transition">Tutor Dashboard</Link>
          )}
          {role === "student" && (
            <Link to="/student" className="hover:text-teal-200 transition">Student Dashboard</Link>
          )}

          {/* Auth buttons */}
          {!isLoggedIn ? (
            <>
              <Link to="/signup" className="hover:text-teal-200 transition">Register</Link>
              <Link to="/login" className="hover:text-teal-200 transition">Login</Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="ml-4 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
