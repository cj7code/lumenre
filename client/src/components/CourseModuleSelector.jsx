// src/components/CourseModuleSelector.jsx
// Reusable dropdown: choose Course → Module
// Props:
//   value: selected moduleId
//   onChange?: (moduleId) => void   // OPTIONAL, SAFE

import { useEffect, useState } from "react";
import api from "../api";

export default function CourseModuleSelector({ value = "", onChange }) {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [courseId, setCourseId] = useState("");

  // -------------------------------------------------------------------------
  // SAFE onChange GUARD
  // -------------------------------------------------------------------------
  const safeOnChange =
    typeof onChange === "function" ? onChange : () => {};

  // -------------------------------------------------------------------------
  // Derive role-based API path
  // -------------------------------------------------------------------------
  const getRoleBasePath = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const role = user?.role;
      if (role === "admin") return "/api/admin";
      if (role === "tutor") return "/api/tutor";
      return "/api/student";
    } catch {
      return "/api/student";
    }
  };

  const basePath = getRoleBasePath();

  // -------------------------------------------------------------------------
  // Load all courses (stable endpoint)
  // -------------------------------------------------------------------------
  useEffect(() => {
    api
      .get("/api/student/courses")
      .then((res) => setCourses(res.data || []))
      .catch(() => setCourses([]));
  }, []);

  // -------------------------------------------------------------------------
  // Load modules when course changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!courseId) {
      setModules([]);
      safeOnChange(""); // SAFE
      return;
    }

    api
      .get(`${basePath}/courses/${courseId}/modules`)
      .then((res) => setModules(res.data || []))
      .catch(() => setModules([]));
  }, [courseId, basePath]);

  return (
    <div className="flex flex-col gap-2">
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

      <select
        className="border rounded p-2"
        value={value}
        onChange={(e) => safeOnChange(e.target.value)}
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
