// src/components/ModuleCreator.jsx
// ---------------------------------------------------------------------------
// ModuleCreator (enhanced & FIXED)
//  - Create AND edit modules under a course
//  - Inline validation (no alerts for basic errors)
//  - Skeleton loading for courses/modules
//  - Toast notifications for server actions
//  - Optional delete module (ADMIN ONLY)
//
//  IMPORTANT:
//  - basePath determines permissions:
//      /api/admin → admin can create, edit, delete
//      /api/tutor → tutor can create, edit (NO delete)
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import api from "../api";

export default function ModuleCreator({
  onCreated,
  basePath = "/api/admin", // 🔑 CRITICAL: injected by AdminDashboard / TutorDashboard
}) {
  // -----------------------------------------
  // State: data
  // -----------------------------------------
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");

  // If null → create mode
  // If string → edit mode
  const [editingModuleId, setEditingModuleId] = useState(null);

  // -----------------------------------------
  // State: loading flags
  // -----------------------------------------
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // -----------------------------------------
  // State: validation
  // -----------------------------------------
  const [errors, setErrors] = useState({
    courseId: "",
    moduleTitle: "",
  });

  // -----------------------------------------
  // State: toast
  // -----------------------------------------
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // -----------------------------------------
  // Load courses (shared endpoint for all roles)
  // -----------------------------------------
  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await api.get("/api/courses");
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("LOAD COURSES ERROR:", err);
        showToast("error", "Failed to load courses");
      }
      setCoursesLoading(false);
    };
    loadCourses();
  }, []);

  // -----------------------------------------
  // Load modules when course changes
  // -----------------------------------------
  useEffect(() => {
    if (!courseId) {
      setModules([]);
      resetForm();
      return;
    }

    const loadModules = async () => {
      setModulesLoading(true);
      try {
        // 🔑 Uses injected basePath (admin OR tutor)
        const res = await api.get(
          `${basePath}/courses/${courseId}/modules`
        );
        setModules(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("LOAD MODULES ERROR:", err);
        showToast("error", "Failed to load modules");
      }
      setModulesLoading(false);
    };

    loadModules();
  }, [courseId, basePath]);

  // -----------------------------------------
  // Validation
  // -----------------------------------------
  const validate = () => {
    const next = { courseId: "", moduleTitle: "" };
    let ok = true;

    if (!courseId) {
      next.courseId = "Please select a course.";
      ok = false;
    }
    if (!moduleTitle.trim()) {
      next.moduleTitle = "Module name is required.";
      ok = false;
    }

    setErrors(next);
    return ok;
  };

  // -----------------------------------------
  // Create OR Update module (metadata only)
  // -----------------------------------------
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        title: moduleTitle.trim(),
        courseId,
      };

      if (editingModuleId) {
        // UPDATE
        const res = await api.put(
          `${basePath}/modules/${editingModuleId}`,
          payload
        );

        const updated = res.data?.module || res.data;
        showToast("success", "Module updated");

        setModules((prev) =>
          prev.map((m) =>
            m._id === editingModuleId ? updated : m
          )
        );

        onCreated?.(editingModuleId);
      } else {
        // CREATE
        const res = await api.post(`${basePath}/modules`, payload);
        const created = res.data?.module || res.data;

        showToast("success", "Module created");

        setModules((prev) => [created, ...prev]);
        setEditingModuleId(created._id);
        onCreated?.(created._id);
      }
    } catch (err) {
      console.error("SAVE MODULE ERROR:", err);
      showToast("error", "Failed to save module");
    }
    setSaving(false);
  };

  // -----------------------------------------
  // Start editing
  // -----------------------------------------
  const startEdit = (mod) => {
    setEditingModuleId(mod._id);
    setModuleTitle(mod.title || "");
    setErrors({ courseId: "", moduleTitle: "" });
    onCreated?.(mod._id);
  };

  // -----------------------------------------
  // Reset form
  // -----------------------------------------
  const resetForm = () => {
    setEditingModuleId(null);
    setModuleTitle("");
    setErrors({ courseId: "", moduleTitle: "" });
  };

  // -----------------------------------------
  // Delete module (ADMIN ONLY)
  // -----------------------------------------
  const handleDelete = async () => {
    if (!editingModuleId) return;
    if (!window.confirm("Delete this module permanently?")) return;

    setDeleting(true);
    try {
      await api.delete(`${basePath}/modules/${editingModuleId}`);
      showToast("success", "Module deleted");

      setModules((prev) =>
        prev.filter((m) => m._id !== editingModuleId)
      );
      resetForm();
      onCreated?.("");
    } catch (err) {
      console.error("DELETE MODULE ERROR:", err);
      showToast("error", "Failed to delete module");
    }
    setDeleting(false);
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------
  return (
    <div className="border p-4 rounded space-y-4">
      {toast && (
        <div
          className={`text-xs px-3 py-2 rounded ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Course Select */}
      <div>
        <label className="text-xs font-semibold">Course</label>
        {coursesLoading ? (
          <div className="h-9 bg-slate-100 animate-pulse rounded" />
        ) : (
          <select
            className="border p-2 rounded w-full text-sm"
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              resetForm();
            }}
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} (Y{c.year} S{c.semester})
              </option>
            ))}
          </select>
        )}
        {errors.courseId && (
          <p className="text-[11px] text-red-600">{errors.courseId}</p>
        )}
      </div>

      {/* Module Name */}
      <div>
        <label className="text-xs font-semibold">
          {editingModuleId ? "Edit module name" : "New module name"}
        </label>
        <input
          className="border p-2 rounded w-full text-sm"
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
        />
        {errors.moduleTitle && (
          <p className="text-[11px] text-red-600">{errors.moduleTitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-slate-500">
          {editingModuleId ? "Editing existing module" : "Create new module"}
        </span>

        <div className="flex gap-2">
          {/* 🔒 Delete only visible for admin */}
          {editingModuleId && basePath.includes("/admin") && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs px-3 py-2 border border-red-300 text-red-700 rounded"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !courseId}
            className="bg-primary text-white px-4 py-2 rounded text-sm"
          >
            {saving
              ? "Saving…"
              : editingModuleId
              ? "Save Changes"
              : "Create Module"}
          </button>
        </div>
      </div>

      {/* Module list */}
      {courseId && (
        <div className="pt-3 border-t">
          {modulesLoading ? (
            <div className="h-8 bg-slate-100 animate-pulse rounded" />
          ) : (
            <ul className="flex flex-wrap gap-2">
              {modules.map((m) => (
                <li key={m._id}>
                  <button
                    onClick={() => startEdit(m)}
                    className={`text-xs px-3 py-1 rounded-full border ${
                      editingModuleId === m._id
                        ? "bg-primary text-white"
                        : "bg-slate-50"
                    }`}
                  >
                    {m.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
