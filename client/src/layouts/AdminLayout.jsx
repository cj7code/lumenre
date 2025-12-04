// src/layouts/AdminLayout.jsx
// ---------------------------------------------------------
// AdminLayout
// - Checks that the logged-in user is an admin
// - Shows a left sidebar with admin navigation
// - Renders nested routes via <Outlet />
// ---------------------------------------------------------
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Load user from localStorage and redirect if not admin
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed.role !== "admin") {
        // Not an admin → send away
        navigate("/");
        return;
      }
      setUser(parsed);
    } catch (e) {
      console.error("Failed to parse user", e);
      navigate("/login");
    }
  }, [navigate]);

  // Optional: show nothing while checking
  if (!user) {
    return <div className="p-6">Checking admin access...</div>;
  }

  // Helper for active link styling
  const navLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded text-sm ${
      isActive
        ? "bg-teal-600 text-white"
        : "text-slate-200 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <div className="flex min-h-[70vh]">
      {/* Left sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 p-4 space-y-4">
        <div>
          <p className="text-xs uppercase text-slate-400">Admin panel</p>
          <h2 className="text-lg font-semibold">
            {user.name || "Admin"}
          </h2>
        </div>

        <nav className="space-y-1">
          <NavLink to="/admin" end className={navLinkClass}>
            Dashboard & AI drafts
          </NavLink>
          <NavLink to="/admin/uploads" className={navLinkClass}>
            File uploads
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>
            Manage users
          </NavLink>
          <NavLink to="/admin/analytics" className={navLinkClass}>
            Analytics
          </NavLink>
        </nav>

        <p className="text-[11px] text-slate-500 mt-6">
          Lumenre • Admin tools for managing courses, notes, quizzes & users.
        </p>
      </aside>

      {/* Right content area (nested pages) */}
      <section className="flex-1 p-6">
        <Outlet />
      </section>
    </div>
  );
}
