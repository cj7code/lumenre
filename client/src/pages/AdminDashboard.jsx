// ============================================================================
// AdminDashboard.jsx
// TOOL-BASED, CONTEXT-AWARE DASHBOARD (FIXED)
// ============================================================================

import { useState, useEffect } from "react";
import api from "../api";

import CourseModuleSelector from "../components/CourseModuleSelector";
import ModuleCreator from "../components/ModuleCreator";
import ModuleContentEditor from "../components/ModuleContentEditor";
import QuizBuilder from "../components/QuizBuilder";

export default function AdminDashboard() {
  const [activeTool, setActiveTool] = useState("modules");
  const toolsRequiringModule = ["content", "ai", "uploads", "quizzes"];

  const [moduleId, setModuleId] = useState("");

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

    await api.post("/api/admin/drafts", fd);
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
            basePath="/api/admin"
            onCreated={(id) => setModuleId(id)}
          />
        )}

        {/* CONTENT EDITOR */}
        {activeTool === "content" &&
          (moduleId ? (
            <ModuleContentEditor
              moduleId={moduleId}
              basePath="/api/admin"
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
              <input type="file" onChange={(e) => setAiFile(e.target.files[0])} />
              <button className="bg-primary text-white px-4 py-2 rounded">
                Generate Draft
              </button>
            </form>
          ) : (
            <p className="text-slate-500">Select a module first.</p>
          ))}

        {/* UPLOADS */}
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
