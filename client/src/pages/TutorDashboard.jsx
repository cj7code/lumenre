// ============================================================================
// TutorDashboard.jsx (FINAL)
// ============================================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

// Shared components
import CourseModuleSelector from "../components/CourseModuleSelector";
import QuizBuilder from "../components/QuizBuilder";
import ModuleCreator from "../components/ModuleCreator";
import ModuleContentEditor from "../components/ModuleContentEditor";

export default function TutorDashboard() {
  // -------------------------------------------
  //  AI DRAFT FORM
  // -------------------------------------------
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [aiFile, setAiFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // -------------------------------------------
  //  DIRECT UPLOAD
  // -------------------------------------------
  const [uploadModuleId, setUploadModuleId] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [moduleFiles, setModuleFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // -------------------------------------------
  //  DRAFTS LIST
  // -------------------------------------------
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  // -------------------------------------------
  //  AUTH HEADER
  // -------------------------------------------
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // -------------------------------------------
  //  LOAD DRAFTS ON START
  // -------------------------------------------
  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const res = await api.get("/api/tutor/drafts", { headers: authHeader() });
      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load drafts");
    }
    setLoadingDrafts(false);
  };

  // =====================================================================
  //  AI DRAFT SUBMISSION
  // =====================================================================
  const handleAIDraftSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("Title is required");
    if (!moduleId) return alert("Select a module");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("moduleId", moduleId);
    if (rawContent) fd.append("rawContent", rawContent);
    if (aiFile) fd.append("file", aiFile);

    setAiLoading(true);

    try {
      await api.post("/api/tutor/drafts", fd, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      alert("AI draft created");
      setTitle("");
      setRawContent("");
      setAiFile(null);
      fetchDrafts();
    } catch (err) {
      console.error(err);
      alert("AI draft creation failed");
    }

    setAiLoading(false);
  };

  // =====================================================================
  //  DIRECT FILE UPLOAD (WITH PROGRESS BAR)
  // =====================================================================
  const uploadModuleFile = async () => {
    if (!uploadModuleId) return alert("Choose module");
    if (!uploadFile) return alert("Choose file");

    const fd = new FormData();
    fd.append("file", uploadFile);

    setUploadProgress(0);

    try {
      await api.post(`/api/tutor/modules/${uploadModuleId}/upload`, fd, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (ev) => {
          if (!ev.total) return;
          const percent = Math.round((ev.loaded * 100) / ev.total);
          setUploadProgress(percent);
        },
      });

      alert("Uploaded");
      setUploadProgress(0);
      loadModuleFiles(uploadModuleId);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
      setUploadProgress(0);
    }
  };

  const loadModuleFiles = async (modId) => {
    if (!modId) return;
    setFilesLoading(true);

    try {
      const res = await api.get(`/api/tutor/modules/${modId}/files`, {
        headers: authHeader(),
      });
      setModuleFiles(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load files");
    }

    setFilesLoading(false);
  };

  // =====================================================================
  //  PUBLISH / DELETE DRAFT (Tutor)
// =====================================================================
  const handlePublish = async (draftId) => {
    if (!window.confirm("Publish this draft?")) return;

    try {
      await api.post(
        `/api/tutor/drafts/${draftId}/publish`,
        {},
        { headers: authHeader() }
      );
      alert("Draft published");
      fetchDrafts();
    } catch (err) {
      console.error(err);
      alert("Publish failed");
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm("Delete this draft?")) return;

    try {
      await api.delete(`/api/tutor/drafts/${draftId}`, {
        headers: authHeader(),
      });
      alert("Draft deleted");
      fetchDrafts();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // =====================================================================
  //  RENDER UI
  // =====================================================================
  return (
    <div className="max-w-7xl mx-auto p-6 flex gap-6">
      {/* -------------------------------- SIDEBAR -------------------------------- */}
      <aside className="w-56 bg-white shadow rounded p-4 h-fit">
        <h2 className="font-bold text-lg mb-4">Tutor Panel</h2>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/tutor" className="text-primary font-semibold">
            🏠 Dashboard
          </Link>
          <Link to="/tutor/uploads" className="hover:text-primary">
            📁 File Manager
          </Link>
          <Link to="/tutor/analytics" className="hover:text-primary">
            📊 My Analytics
          </Link>
          <Link to="/tutor/quizzes" className="hover:text-primary">
            📝 Quiz Builder
          </Link>
        </nav>
      </aside>

      {/* --------------------------- MAIN CONTENT --------------------------- */}
      <div className="flex-1 space-y-10">
        {/* =======================================================================
            MODULE CREATOR
        ======================================================================== */}
        <section className="p-6 bg-white shadow rounded space-y-3">
          <h2 className="text-xl font-bold">Create New Module / Topic</h2>

          <ModuleCreator
            onCreated={(newId) => {
              setModuleId(newId);
              setUploadModuleId(newId);
            }}
          />

          {moduleId && (
            <p className="text-xs text-slate-500">
              Selected module: <code>{moduleId}</code>
            </p>
          )}
        </section>

        {/* =======================================================================
            MODULE CONTENT EDITOR (Manual + AI)
        ======================================================================== */}
        <ModuleContentEditor moduleId={moduleId} basePath="/api/tutor" />

        {/* =======================================================================
            AI CONTENT GENERATOR (DRAFTS)
        ======================================================================== */}
        <section className="p-6 bg-white shadow rounded space-y-4">
          <h2 className="text-2xl font-semibold">AI Draft Generator</h2>

          <form onSubmit={handleAIDraftSubmit} className="space-y-3">
            <input
              className="border rounded p-2 w-full"
              placeholder="Draft Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <CourseModuleSelector value={moduleId} onChange={setModuleId} />

            <textarea
              className="border rounded p-2 w-full h-32"
              placeholder="Paste raw content..."
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
            />

            <input
              type="file"
              onChange={(e) => setAiFile(e.target.files[0])}
            />

            <button
              type="submit"
              disabled={aiLoading}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              {aiLoading ? "Processing..." : "Generate AI Draft"}
            </button>
          </form>
        </section>

        {/* =======================================================================
            AI DRAFT LIST
        ======================================================================== */}
        <section className="p-6 bg-white shadow rounded space-y-3">
          <h2 className="text-xl font-bold">AI Drafts</h2>

          {loadingDrafts ? (
            <p>Loading drafts…</p>
          ) : drafts.length === 0 ? (
            <p>No drafts yet.</p>
          ) : (
            drafts.map((d) => (
              <div key={d._id} className="border rounded p-3">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold">{d.title}</h3>
                    <p className="text-xs text-slate-600">
                      Status: {d.status}
                      {d.module && ` • Module: ${d.module}`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={d.status === "published"}
                      onClick={() => handlePublish(d._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Publish
                    </button>
                    <button
                      className="text-red-600 text-sm underline"
                      onClick={() => handleDeleteDraft(d._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* =======================================================================
            DIRECT FILE UPLOAD
        ======================================================================== */}
        <section className="p-6 bg-white shadow rounded space-y-4">
          <h2 className="text-2xl font-semibold">Upload Teaching Materials</h2>

          <CourseModuleSelector
            value={uploadModuleId}
            onChange={(val) => {
              setUploadModuleId(val);
              if (val) loadModuleFiles(val);
            }}
          />

          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files[0])}
          />

          <button
            onClick={uploadModuleFile}
            className="bg-teal-600 text-white px-4 py-2 rounded"
          >
            Upload File
          </button>

          {/* Progress bar */}
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded h-3">
              <div
                className="bg-primary h-3 rounded"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* File preview */}
          {filesLoading && (
            <p className="text-xs text-slate-500">Loading files…</p>
          )}

          {moduleFiles.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {moduleFiles.map((f) => (
                <li
                  key={f.public_id}
                  className="border p-2 rounded flex justify-between"
                >
                  <span>{f.originalName || f.type}</span>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* =======================================================================
            QUIZ BUILDER
        ======================================================================== */}
        <section className="p-6 bg-white shadow rounded space-y-3">
          <h2 className="text-xl font-bold">Manual Quiz Builder</h2>

          {!moduleId && (
            <p className="text-red-600 text-sm">
              Select or create a module above.
            </p>
          )}

          <QuizBuilder moduleId={moduleId} />
        </section>
      </div>
    </div>
  );
}
