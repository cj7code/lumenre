// ------------------------------------------------------------
// AdminDashboard.jsx
// Full admin panel: 
// - AI generation (notes, quizzes, slides)
// - Direct file uploads per module
// - Manage drafts
// - Admin navigation shortcuts
// ------------------------------------------------------------

import { useState, useEffect } from "react";
import axios from "../api";

export default function AdminDashboard() {
  // ------------------------ STATES --------------------------
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [file, setFile] = useState(null);

  const [drafts, setDrafts] = useState([]);
  const [moduleFiles, setModuleFiles] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");

  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------
  // Fetch drafts on load
  // ----------------------------------------------------------
  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await axios.get("api/admin/drafts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load drafts");
    }
  };

  // ----------------------------------------------------------
  // AI Draft Upload (raw text or file)
  // ----------------------------------------------------------
  const submitAIDraft = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    const formData = new FormData();
    formData.append("title", title);
    if (moduleId) formData.append("moduleId", moduleId);
    if (rawContent) formData.append("rawContent", rawContent);
    if (file) formData.append("file", file);

    setLoading(true);

    try {
      await axios.post("api/admin/drafts", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Draft created and AI content generated!");
      setTitle("");
      setRawContent("");
      setFile(null);

      fetchDrafts();
    } catch (err) {
      console.error(err);
      alert("AI draft upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
// Publish Draft (FIXED: now sends moduleId)
// ----------------------------------------------------------
const publishDraft = async (draftId) => {
  const mod = moduleId || selectedModule;

  if (!mod) {
    return alert("Please enter a Module ID before publishing.");
  }

  try {
    await axios.post(`api/admin/drafts/${draftId}/publish`, {
      moduleId: mod
    });

    alert("Draft published!");
    fetchDrafts();
  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.error || "Publish failed");
  }
};

  // ----------------------------------------------------------
  // Module File Upload (PDF, PPTX, DOCX, JPG, etc.)
  // ----------------------------------------------------------
  const uploadModuleFile = async () => {
    if (!selectedModule || !file) return alert("Select module and file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`api/admin/modules/${selectedModule}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("File uploaded!");
      loadModuleFiles(selectedModule);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // ----------------------------------------------------------
  // List module files
  // ----------------------------------------------------------
  const loadModuleFiles = async (modId) => {
    try {
      const res = await axios.get(`api/admin/modules/${modId}/files`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setModuleFiles(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load module files");
    }
  };

  // ----------------------------------------------------------
  // RENDER DASHBOARD
  // ----------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">

      {/* ---------------------------------------------------- */}
      {/* ADMIN NAVIGATION SHORTCUTS                          */}
      {/* ---------------------------------------------------- */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => (window.location.href = "/admin")}
          className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-teal-700"
        >
          Drafts
        </button>

        <button
          onClick={() => (window.location.href = "/admin/users")}
          className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-teal-700"
        >
          Manage Users
        </button>

        <button
          onClick={() => (window.location.href = "/admin/uploads")}
          className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-teal-700"
        >
          Uploads
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* AI GENERATION SECTION                                */}
      {/* ---------------------------------------------------- */}
      <section className="p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">AI Content Generator</h2>

        <form onSubmit={submitAIDraft} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Draft title"
            className="w-full border p-2 rounded"
          />

          <input
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            placeholder="Module ID (optional)"
            className="w-full border p-2 rounded"
          />

          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="Paste raw content for AI"
            className="w-full border p-2 rounded h-32"
          />

          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            {loading ? "Generating..." : "Upload & Generate"}
          </button>
        </form>
      </section>

      {/* ---------------------------------------------------- */}
      {/* DIRECT FILE UPLOAD SECTION                           */}
      {/* ---------------------------------------------------- */}
      <section className="p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Direct File Upload</h2>

        <div className="space-y-3">
          <input
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            placeholder="Module ID"
            className="w-full border p-2 rounded"
          />

          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <button
            onClick={uploadModuleFile}
            className="bg-teal-600 text-white px-4 py-2 rounded"
          >
            Upload File
          </button>
        </div>

        {/* Show uploaded files */}
        {moduleFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Uploaded Files</h3>
            <ul className="space-y-2">
              {moduleFiles.map((f) => (
                <li key={f.public_id} className="border p-2 rounded">
                  <a
                    href={f.url}
                    target="_blank"
                    className="text-primary underline"
                  >
                    {f.type} — view
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* DRAFTS SECTION                                       */}
      {/* ---------------------------------------------------- */}
      <section className="p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Generated Drafts</h2>

        {drafts.length === 0 && (
          <p className="text-gray-500">No drafts yet.</p>
        )}

        {drafts.map((d) => (
          <div key={d._id} className="border p-4 rounded mb-3">
            <h3 className="font-bold">{d.title}</h3>
            <p className="text-sm">Status: {d.status}</p>

            <button
              disabled={d.status === "published"}
              onClick={() => publishDraft(d._id)}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-400"
            >
              Publish
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
