// src/components/TutorDrafts.jsx
import { useState, useEffect } from "react";
import api from "../api";

export default function TutorDrafts() {
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [file, setFile] = useState(null);

  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load drafts
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const res = await api.get("tutor/drafts");   // ✅ FIXED
      setDrafts(res.data || []);
    } catch (err) {
      alert("Failed to load drafts");
    }
  };

  // Create draft
  const submitDraft = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title required");

    const fd = new FormData();
    fd.append("title", title);
    if (moduleId) fd.append("moduleId", moduleId);
    if (rawContent) fd.append("rawContent", rawContent);
    if (file) fd.append("file", file);

    setLoading(true);
    try {
      await api.post("tutor/drafts", fd, {       // ✅ FIXED (removed slash)
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Draft created!");
      setTitle("");
      setRawContent("");
      setFile(null);
      loadDrafts();
    } catch (e) {
      alert("Creating draft failed");
    } finally {
      setLoading(false);
    }
  };

  // Publish draft
  // Publish draft (FIXED)
  const publishDraft = async (id) => {
    if (!window.confirm("Publish this draft?")) return;

  // Ask tutor for module ID if draft doesn't have one
  const mod = prompt("Enter Module ID for this draft:");

  if (!mod || mod.trim() === "") {
    return alert("Module ID is required to publish.");
  }

  try {
    await api.post(`tutor/drafts/${id}/publish`, {
      moduleId: mod.trim()
    });

    alert("Draft published!");
    loadDrafts();
    } 
    catch (e) {
        console.error(e);
        alert("Publish failed");
    }
  };

  return (
    <section className="bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">AI Draft Generator</h2>

      <form onSubmit={submitDraft} className="space-y-3">
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
          placeholder="Paste content"
          className="w-full border p-2 rounded h-32"
        />

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate Draft"}
        </button>
      </form>

      {/* Draft list */}
      <div className="space-y-3 mt-6">
        <h3 className="text-xl font-semibold">Your Drafts</h3>

        {drafts.length === 0 && <p>No drafts yet.</p>}

        {drafts.map((d) => (
          <div key={d._id} className="border p-4 rounded">
            <h3 className="font-bold text-lg">{d.title}</h3>
            <p>Status: {d.status}</p>

            <button
              disabled={d.status === "published"}
              onClick={() => publishDraft(d._id)}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-400"
            >
              Publish
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
