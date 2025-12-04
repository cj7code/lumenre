// src/layouts/TutorLayout.jsx
// ---------------------------------------------------------
// TutorLayout
// - Checks user is a tutor
// - Simpler sidebar (no user management)
// - Renders nested <Outlet /> for tutor pages
// ---------------------------------------------------------
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function TutorLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Only tutors allowed here
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed.role !== "tutor" && parsed.role !== "admin") {
        // Optionally allow admin to see tutor area, or block:
        // if (parsed.role !== "tutor") navigate("/");
        navigate("/");
        return;
      }
      setUser(parsed);
    } catch (e) {
      console.error("Failed to parse user", e);
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    return <div className="p-6">Checking tutor access...</div>;
  }

  const navLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded text-sm ${
      isActive
        ? "bg-teal-600 text-white"
        : "text-slate-200 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <div className="flex min-h-[70vh]">
      {/* Tutor sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 p-4 space-y-4">
        <div>
          <p className="text-xs uppercase text-slate-400">Tutor panel</p>
          <h2 className="text-lg font-semibold">
            {user.name || "Tutor"}
          </h2>
        </div>

        <nav className="space-y-1">
          <NavLink to="/tutor" end className={navLinkClass}>
            Tutor dashboard
          </NavLink>
          <NavLink to="/tutor/uploads" className={navLinkClass}>
            Upload teaching materials
          </NavLink>
        </nav>

        <p className="text-[11px] text-slate-500 mt-6">
          Lumenre • Tutor tools for uploading notes & resources.
        </p>
      </aside>

      {/* Nested routes */}
      <section className="flex-1 p-6">
        <Outlet />
      </section>
    </div>
  );
}
