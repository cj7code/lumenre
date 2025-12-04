// ModuleContentEditor.jsx
// ------------------------------------------------------
// TipTap v3 rich text editor for React 19
// Includes:
//  - AI integration (AiNotesHelper)
//  - Manual editing
//  - Load + Save module content
// ------------------------------------------------------

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import api from "../api";

import AiNotesHelper from "./AiNotesHelper";
import TiptapToolbar from "./TiptapToolbar";

export default function ModuleContentEditor({ moduleId, basePath }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // TipTap Editor Instance
  const editor = useEditor({
    extensions: [
      // ✅ Disable built-in heading to avoid duplicate extension warning
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [2, 3],
      }),
    ],
    content: "",
  });

  // LOAD MODULE CONTENT
  useEffect(() => {
    if (!editor) return;
    if (!moduleId) {
      editor.commands.setContent("");
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${basePath}/modules/${moduleId}`);
        if (!cancelled) {
          editor.commands.setContent(res.data?.content || "");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load module content");
      }
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [moduleId, editor, basePath]);

  // SAVE MODULE CONTENT
  const handleSave = async () => {
    if (!moduleId) return alert("Select a module first.");

    setSaving(true);
    try {
      await api.put(`${basePath}/modules/${moduleId}/content`, {
        content: editor.getHTML(),
      });

      alert("Module content saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save module content");
    }
    setSaving(false);
  };

  // INJECT AI NOTES INTO EDITOR
  const handleAiInsert = (text) => {
    editor.commands.setContent(text);
  };

  return (
    <section className="p-6 bg-white shadow rounded space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Module Content Editor</h2>
        {!moduleId && (
          <span className="text-xs text-red-600">Select a module first</span>
        )}
      </div>

      {/* AI GENERATION */}
      {moduleId && (
        <AiNotesHelper moduleId={moduleId} onNotesReady={handleAiInsert} />
      )}

      {/* TOOLBAR */}
      <TiptapToolbar editor={editor} />

      {/* EDITOR */}
      <div
        className={`border rounded p-3 bg-white ${
          loading ? "opacity-60" : ""
        }`}
      >
        <EditorContent editor={editor} />
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        disabled={!moduleId || saving}
        className="bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Content"}
      </button>
    </section>
  );
}
