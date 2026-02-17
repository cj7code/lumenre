// src/layouts/TutorLayout.jsx
// ---------------------------------------------------------
// TutorLayout (ADMIN-MIRROR)
// ---------------------------------------------------------
// ✔ Same structure as AdminLayout
// ✔ Same sidebar sections & UX
// ✔ Includes uploads & analytics navigation
// ✔ No TutorUploads.jsx dependency
// ✔ All logic routed through TutorDashboard / shared tools
// ---------------------------------------------------------

import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function TutorLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // Access control (mirrors AdminLayout)
  // ---------------------------------------------------------
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      // Tutors allowed (admins optionally allowed)
      if (parsed.role !== "tutor" && parsed.role !== "admin") {
        navigate("/");
        return;
      }

      setUser(parsed);
    } catch (err) {
      console.error("Failed to parse user", err);
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    return <div className="p-6">Checking tutor access...</div>;
  }

  // ---------------------------------------------------------
  // Active link styling (IDENTICAL to AdminLayout)
  // ---------------------------------------------------------
  const navLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded text-sm ${
      isActive
        ? "bg-teal-600 text-white"
        : "text-slate-200 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <div className="flex min-h-[70vh]">
      {/* ----------------------------------------------------- */}
      {/* LEFT SIDEBAR (ADMIN-MIRROR)                          */}
      {/* ----------------------------------------------------- */}
      <aside className="w-64 bg-slate-900 text-slate-100 p-4 space-y-4">
        <div>
          <p className="text-xs uppercase text-slate-400">Tutor panel</p>
          <h2 className="text-lg font-semibold">
            {user.name || "Tutor"}
          </h2>
        </div>

        <nav className="space-y-1">
          <NavLink to="/tutor" end className={navLinkClass}>
            Dashboard & teaching tools
          </NavLink>

          <NavLink to="/tutor/uploads" className={navLinkClass}>
            File uploads
          </NavLink>

          <NavLink to="/tutor/analytics" className={navLinkClass}>
            Analytics
          </NavLink>
        </nav>

        <p className="text-[11px] text-slate-500 mt-6">
          Lumenre • Tutor tools for managing modules, content, quizzes & analytics.
        </p>
      </aside>

      {/* ----------------------------------------------------- */}
      {/* RIGHT CONTENT AREA (Nested routes)                   */}
      {/* ----------------------------------------------------- */}
      <section className="flex-1 p-6">
        <Outlet />
      </section>
    </div>
  );
}
