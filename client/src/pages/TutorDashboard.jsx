// ============================================================================
// TutorDashboard.jsx
// TOOL-BASED, CONTEXT-AWARE DASHBOARD (ADMIN CLONE — SAFE)
// ----------------------------------------------------------------------------
// PURPOSE:
// - Exact structural and UI duplicate of AdminDashboard
// - No embedded upload manager (prevents auto-downloads)
// - Tutor-specific API paths only where required
// ============================================================================

import { useState, useEffect } from "react";
import api from "../api";

import CourseModuleSelector from "../components/CourseModuleSelector";
import ModuleCreator from "../components/ModuleCreator";
import ModuleContentEditor from "../components/ModuleContentEditor";
import QuizBuilder from "../components/QuizBuilder";

export default function TutorDashboard() {
  // --------------------------------------------------------------------------
  // TOOL STATE (IDENTICAL TO ADMIN)
  // --------------------------------------------------------------------------
  const [activeTool, setActiveTool] = useState("modules");
  const toolsRequiringModule = ["content", "ai", "uploads", "quizzes"];

  // GLOBAL MODULE CONTEXT
  const [moduleId, setModuleId] = useState("");

  // AI DRAFT STATE
  const [title, setTitle] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [aiFile, setAiFile] = useState(null);

  // --------------------------------------------------------------------------
  // AUTO-SWITCH TO CONTENT AFTER MODULE CREATION
  // (MATCHES ADMIN DASHBOARD BEHAVIOUR)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (moduleId && activeTool === "modules") {
      setActiveTool("content");
    }
  }, [moduleId]);

  // --------------------------------------------------------------------------
  // TUTOR AI DRAFT SUBMISSION
  // (ONLY DIFFERENCE FROM ADMIN IS ENDPOINT)
  // --------------------------------------------------------------------------
  const handleAIDraftSubmit = async (e) => {
    e.preventDefault();
    if (!title || !moduleId) return alert("Title and module required");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("moduleId", moduleId);
    if (rawContent) fd.append("rawContent", rawContent);
    if (aiFile) fd.append("file", aiFile);

    await api.post("/api/tutor/drafts", fd);

    // Reset form
    setTitle("");
    setRawContent("");
    setAiFile(null);

    alert("Draft created");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6 min-h-[80vh]">
      {/* ------------------------------------------------------------------ */}
      {/* SIDEBAR — IDENTICAL TO ADMIN                                       */}
      {/* ------------------------------------------------------------------ */}
      <aside className="col-span-3 bg-white border rounded-xl p-4 space-y-2">
        {[
          ["modules", "📚 Modules"],
          ["content", "✍️ Content"],
          ["ai", "🤖 AI Drafts"],
          ["uploads", "📁 Uploads"],
          ["quizzes", "📝 Quizzes"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setActiveTool(k)}
            className={`w-full text-left px-3 py-2 rounded ${
              activeTool === k
                ? "bg-primary text-white"
                : "hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN PANEL                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main className="col-span-9 bg-white border rounded-xl p-6 space-y-6">
        {/* GLOBAL MODULE SELECTOR */}
        {toolsRequiringModule.includes(activeTool) && (
          <CourseModuleSelector value={moduleId} onChange={setModuleId} />
        )}

        {/* MODULE CREATION */}
        {activeTool === "modules" && (
          <ModuleCreator
            basePath="/api/tutor"
            onCreated={(id) => setModuleId(id)}
          />
        )}

        {/* CONTENT EDITOR */}
        {activeTool === "content" &&
          (moduleId ? (
            <ModuleContentEditor
              moduleId={moduleId}
              basePath="/api/tutor"
            />
          ) : (
            <p className="text-slate-500">Select a module first.</p>
          ))}

        {/* AI DRAFTS */}
        {activeTool === "ai" &&
          (moduleId ? (
            <form onSubmit={handleAIDraftSubmit} className="space-y-3">
              <input
                className="border p-2 w-full"
                placeholder="Draft title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="border p-2 w-full h-32"
                placeholder="Raw content"
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
              />
              <input
                type="file"
                onChange={(e) => setAiFile(e.target.files[0])}
              />
              <button className="bg-primary text-white px-4 py-2 rounded">
                Generate Draft
              </button>
            </form>
          ) : (
            <p className="text-slate-500">Select a module first.</p>
          ))}

        {/* UPLOADS — SAME SAFE PLACEHOLDER AS ADMIN (NO AUTO-DOWNLOAD) */}
        {activeTool === "uploads" &&
          (moduleId ? (
            <input type="file" />
          ) : (
            <p className="text-slate-500">Select a module first.</p>
          ))}

        {/* QUIZZES */}
        {activeTool === "quizzes" &&
          (moduleId ? (
            <QuizBuilder moduleId={moduleId} />
          ) : (
            <p className="text-slate-500">Select a module first.</p>
          ))}
      </main>
    </div>
  );
}
