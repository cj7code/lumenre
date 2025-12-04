// src/pages/AdminAnalytics.jsx
// Lightweight analytics using existing endpoints (courses + drafts)

import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function AdminAnalytics() {
  const [courses, setCourses] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cRes, dRes] = await Promise.all([
          api.get("api/student/courses"),
          api.get("/api/admin/drafts"),
        ]);
        setCourses(cRes.data || []);
        setDrafts(dRes.data || []);
      } catch (err) {
        console.error("Analytics load error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCourses = courses.length;
  const totalDrafts = drafts.length;
  const publishedDrafts = drafts.filter((d) => d.status === "published").length;
  const generatedDrafts = drafts.filter(
    (d) => d.status === "generated"
  ).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin — Analytics</h1>
        <Link
          to="/admin"
          className="text-sm text-primary underline hover:no-underline"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Courses" value={totalCourses} />
          <StatCard label="Total Drafts" value={totalDrafts} />
          <StatCard label="Published Drafts" value={publishedDrafts} />
          <StatCard label="Generated (Pending)" value={generatedDrafts} />
        </div>
      )}

      <p className="text-xs text-slate-500">
        Advanced analytics (e.g. quiz stats, AI error rates) can be added later
        with a dedicated <code>/api/admin/stats</code> endpoint.
      </p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded shadow p-4 text-center">
      <div className="text-xs uppercase text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
