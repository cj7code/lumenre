// src/components/AiNotesHelper.jsx
import { useState } from "react";
import api from "../api";

export default function AiNotesHelper({ moduleId, onNotesReady }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/api/ai/generate", { prompt, moduleId });
      const generated = res.data.notes || "";
      setNotes(generated);
      if (onNotesReady) onNotesReady(generated);
    } catch (err) {
      alert("AI generation failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 bg-white shadow-sm space-y-3">
      <h3 className="font-semibold text-sm">AI Notes Generator</h3>
      <form onSubmit={handleGenerate} className="space-y-2">
        <textarea
          className="w-full border rounded px-2 py-1 text-sm"
          rows={3}
          placeholder="Describe what notes you want (e.g. pediatric dehydration nursing care)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-3 py-1 rounded text-sm disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate with AI"}
        </button>
      </form>

      {notes && (
        <div className="mt-2">
          <p className="text-xs font-semibold mb-1">AI suggestion:</p>
          <pre className="text-xs bg-slate-50 border rounded p-2 whitespace-pre-wrap">
            {notes}
          </pre>
        </div>
      )}
    </div>
  );
}
