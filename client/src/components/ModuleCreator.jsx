import { useState, useEffect } from "react";
import api from "../api";

export default function ModuleCreator({ onCreated }) {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // Load all courses once
  useEffect(() => {
    api.get("/api/courses")
      .then((res) => setCourses(res.data || []))
      .catch((err) => console.error("Failed to load courses", err));
  }, []);

  const handleCreateModule = async () => {
    if (!courseId) return alert("Please select a course");
    if (!moduleTitle.trim()) return alert("Module name required");

    setSaving(true);

    try {
      // Only ONE request needed — backend automatically updates Course.modules[]
      const res = await api.post("/api/admin/modules", {
        title: moduleTitle,
        courseId,
      });

      const newModule = res.data.module;

      alert(`Module created: ${newModule.title}`);

      // Notify parent
      onCreated(newModule._id);

      // Reset input
      setModuleTitle("");

    } catch (err) {
      console.error(err);
      alert("Failed to create module");
    }

    setSaving(false);
  };

  return (
    <div className="border p-4 rounded space-y-3">
      <select
        className="border p-2 rounded w-full"
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

      <input
        className="border p-2 rounded w-full"
        placeholder="Module name"
        value={moduleTitle}
        onChange={(e) => setModuleTitle(e.target.value)}
      />

      <button
        onClick={handleCreateModule}
        disabled={saving}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        {saving ? "Creating..." : "Create Module"}
      </button>
    </div>
  );
}
