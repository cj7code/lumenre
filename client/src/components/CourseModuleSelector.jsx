// src/components/CourseModuleSelector.jsx
// Reusable dropdown: choose Course → Module
// Props:
//   value: selected moduleId
//   onChange: (moduleId) => void

import { useEffect, useState } from "react";
import api from "../api";

export default function CourseModuleSelector({ value, onChange }) {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [courseId, setCourseId] = useState("");

  // Derive role from logged-in user
  const getRoleBasePath = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const role = user?.role;
      if (role === "admin") return "/api/admin";
      if (role === "tutor") return "/api/tutor";
      return "/api/student"; // safe fallback
    } catch {
      return "/api/student";
    }
  };

  const basePath = getRoleBasePath();

  // Load all courses once – use student API which we know works
  useEffect(() => {
    api
      .get("/api/student/courses")
      .then((res) => setCourses(res.data || []))
      .catch((err) => {
        console.error("Failed to load courses", err);
      });
  }, []);

  // When course changes, load its modules (role-based)
  useEffect(() => {
    if (!courseId) {
      setModules([]);
      onChange(""); // clear module
      return;
    }

    api
      .get(`${basePath}/courses/${courseId}/modules`)
      .then((res) => {
        setModules(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load modules", err);
        setModules([]);
      });
  }, [courseId, basePath, onChange]);

  return (
    <div className="flex flex-col gap-2">
      {/* Course dropdown */}
      <select
        className="border rounded p-2"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
      >
        <option value="">Select course</option>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>
            {c.title} (Y{c.year} S{c.semester})
          </option>
        ))}
      </select>

      {/* Module dropdown (depends on course) */}
      <select
        className="border rounded p-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!courseId || modules.length === 0}
      >
        <option value="">
          {courseId ? "Select module" : "Select course first"}
        </option>
        {modules.map((m) => (
          <option key={m._id} value={m._id}>
            {m.title}
          </option>
        ))}
      </select>
    </div>
  );
}
