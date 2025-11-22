// ------------------------------------------------------------
// AdminDashboard.jsx (FULLY FIXED)
// ------------------------------------------------------------

import { useState, useEffect } from "react";
import api from "../api";

// BASE PATH for all admin routes
const ADMIN = "admin";

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [file, setFile] = useState(null);

  const [drafts, setDrafts] = useState([]);
  const [moduleFiles, setModuleFiles] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");

  const [loading, setLoading] = useState(false);

  // Load drafts
  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await api.get(`${ADMIN}/drafts`);
      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      alert("Failed to load drafts");
    }
  };

  const submitAIDraft = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    const fd = new FormData();
    fd.append("title", title);
    if (moduleId) fd.append("moduleId", moduleId);
    if (rawContent) fd.append("rawContent", rawContent);
    if (file) fd.append("file", file);

    setLoading(true);

    try {
      await api.post(`${ADMIN}/drafts`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Draft created!");
      setTitle("");
      setRawContent("");
      setFile(null);
      fetchDrafts();
    } catch (e) {
      console.error(e);
      alert("Draft creation failed");
    } finally {
      setLoading(false);
    }
  };

  const publishDraft = async (id) => {
    try {
      await api.post(`${ADMIN}/drafts/${id}/publish`);
      alert("Draft published!");
      fetchDrafts();
    } catch (e) {
      console.error(e);
      alert("Publish failed");
    }
  };

  const uploadModuleFile = async () => {
    if (!selectedModule || !file) return alert("Module + file required");

    const fd = new FormData();
    fd.append("file", file);

    try {
      await api.post(`${ADMIN}/modules/${selectedModule}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("File uploaded!");
      loadModuleFiles(selectedModule);
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    }
  };

  const loadModuleFiles = async (modId) => {
    try {
      const res = await api.get(`${ADMIN}/modules/${modId}/files`);
      setModuleFiles(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load files");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* ADMIN BUTTONS */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => (window.location.href = "/admin")}
          className="px-4 py-2 bg-primary text-white rounded">
          Drafts
        </button>

        <button onClick={() => (window.location.href = "/admin/users")}
          className="px-4 py-2 bg-primary text-white rounded">
          Manage Users
        </button>

        <button onClick={() => (window.location.href = "/admin/uploads")}
          className="px-4 py-2 bg-primary text-white rounded">
          Uploads
        </button>
      </div>

      {/* --- AI GENERATOR FORM --- */}
      <section className="p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">AI Content Generator</h2>

        <form onSubmit={submitAIDraft} className="space-y-3">
          <input className="w-full border p-2 rounded"
            placeholder="Draft title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input className="w-full border p-2 rounded"
            placeholder="Module ID"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
          />
          <textarea className="w-full border p-2 rounded h-32"
            placeholder="Paste content"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
          />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <button disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded">
            {loading ? "Generating..." : "Upload & Generate"}
          </button>
        </form>
      </section>

      {/* --- MODULE UPLOADS --- */}
      <section className="p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Direct File Upload</h2>

        <input className="w-full border p-2 rounded"
          placeholder="Module ID"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        />

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button
          onClick={uploadModuleFile}
          className="bg-teal-600 text-white px-4 py-2 rounded"
        >
          Upload File
        </button>

        {/* Show module uploads */}
        {moduleFiles?.length > 0 && (
          <ul className="mt-4 space-y-2">
            {moduleFiles.map((f) => (
              <li key={f.public_id} className="border p-2 rounded">
                <a href={f.url} target="_blank" className="underline text-primary">
                  {f.type} — view
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- DRAFT LIST --- */}
      <section className="p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Generated Drafts</h2>

        {drafts.length === 0 && <p>No drafts yet.</p>}

        {drafts.map((d) => (
          <div key={d._id} className="border p-4 rounded mb-3">
            <h3 className="font-bold">{d.title}</h3>
            <p>Status: {d.status}</p>

            <button
              disabled={d.status === "published"}
              onClick={() => publishDraft(d._id)}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded
              disabled:bg-gray-400"
            >
              Publish
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
