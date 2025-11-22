// ------------------------------------------------------------
// AdminUsers.jsx
// Location: client/src/pages/AdminUsers.jsx
//
// FIXED ISSUES:
// - Removed accidental self-import (AdminUsers importing AdminUsers)
// - Fixed delete bug (u._1d → u._id)
// - Prevented duplicate declaration error
// - Cleaned comments & improved clarity
// - Ensured axios instance imported correctly
// ------------------------------------------------------------

import React, { useEffect, useState } from "react";
import api from "../api"; 
// ❌ Removed: import AdminUsers from "./pages/AdminUsers"; (self-import caused crash)

export default function AdminUsers() {
  // ----------------------------- STATE ------------------------------
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & pagination
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Create-user modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    phone: "",
    year: 1,
    semester: 1,
  });

  // ----------------------------- LOAD USERS ------------------------------
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- CREATE USER ------------------------------
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      return alert("Name, email and password are required");
    }

    setSaving(true);

    try {
      const res = await api.post("admin/users", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Update list locally
      setUsers((prev) => [res.data.user, ...prev]);

      setShowModal(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        phone: "",
        year: 1,
        semester: 1,
      });

      alert("User created successfully!");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------- UPDATE ROLE ------------------------------
  const updateRole = async (id, newRole) => {
    if (!window.confirm(`Change role to "${newRole}"?`)) return;

    try {
      const res = await api.put(
        `admin/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? res.data.user : u))
      );

      alert("Role updated");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Update failed");
    }
  };

  // ----------------------------- DELETE USER ------------------------------
  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;

    try {
      await api.delete(`admin/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));

      alert("User deleted");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Delete failed");
    }
  };

  // ----------------------------- FILTER & PAGINATE ------------------------------
  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ----------------------------- RENDER ------------------------------
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin — Manage Users</h1>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name / email / role"
            className="border rounded p-2"
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-3 py-2 rounded"
          >
            Create User
          </button>
        </div>
      </header>

      {/* TABLE */}
      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Year</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map((u) => (
                  <tr key={u._id} className="border-b hover:bg-slate-50">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>

                    {/* INLINE ROLE DROPDOWN */}
                    <td className="p-2">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u._id, e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="student">student</option>
                        <option value="tutor">tutor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>

                    <td className="p-2">{u.year || "-"}</td>

                    <td className="p-2">
                      <button
                        onClick={() => deleteUser(u._id)} // ✅ FIXED bug "_1d"
                        className="text-red-600 hover:underline mr-3"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => alert(JSON.stringify(u, null, 2))}
                        className="text-slate-700 hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-500">{total} users</div>

              <div className="space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 border rounded"
                >
                  Prev
                </button>

                <span className="px-2">
                  {page}/{pages}
                </span>

                <button
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="px-2 py-1 border rounded"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ----------------------------- CREATE MODAL ------------------------------ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-3">Create new user</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <div className="flex gap-2">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="border p-2 rounded w-1/2"
                >
                  <option value="student">student</option>
                  <option value="tutor">tutor</option>
                  <option value="admin">admin</option>
                </select>

                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-1/2 p-2 border rounded"
                />
              </div>

              <div className="flex gap-2">
                <input
                  placeholder="Year"
                  type="number"
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: Number(e.target.value) })
                  }
                  className="w-1/2 p-2 border rounded"
                />

                <input
                  placeholder="Semester"
                  type="number"
                  value={form.semester}
                  onChange={(e) =>
                    setForm({ ...form, semester: Number(e.target.value) })
                  }
                  className="w-1/2 p-2 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-2 bg-primary text-white rounded"
                >
                  {saving ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
