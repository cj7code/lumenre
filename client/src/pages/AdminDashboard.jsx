// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboard() {
  // Form states
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [file, setFile] = useState(null);

  // Drafts list
  const [drafts, setDrafts] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch drafts on page load
  useEffect(() => {
    fetchDrafts();
  }, []);

  // ✅ Fetch drafts from backend
  const fetchDrafts = async () => {
    setFetching(true);
    try {
      const res = await axios.get("/api/admin/drafts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Ensure drafts is always an array
      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch drafts");
      setDrafts([]);
    } finally {
      setFetching(false);
    }
  };

  // ✅ Upload file or raw content to create draft
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    const formData = new FormData();
    formData.append("title", title);
    if (moduleId) formData.append("moduleId", moduleId);
    if (rawContent) formData.append("rawContent", rawContent);
    if (file) formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post("/api/admin/draft", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Draft created and AI-generated!");
      setTitle("");
      setRawContent("");
      setFile(null);
      fetchDrafts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Publish a draft
  const handlePublish = async (draftId) => {
    try {
      await axios.post(
        `/api/admin/draft/${draftId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Draft published!");
      fetchDrafts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Publish failed");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="mb-8 p-4 border rounded-lg shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-2">Create AI Draft</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />

        <input
          type="text"
          placeholder="Module ID (optional)"
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />

        <textarea
          placeholder="Raw content (optional)"
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          {loading ? "Uploading..." : "Upload & Generate AI Draft"}
        </button>
      </form>

      {/* Drafts List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Drafts</h2>

        {/* Loading indicator */}
        {fetching && <p>Loading drafts...</p>}

        {/* No drafts placeholder */}
        {!fetching && drafts.length === 0 && (
          <p className="text-gray-500">No drafts found.</p>
        )}

        {/* Draft cards */}
        {Array.isArray(drafts) &&
          drafts.map((d) => (
            <div
              key={d._id}
              className="border p-4 rounded mb-2 shadow-sm"
            >
              <h3 className="font-bold">{d.title}</h3>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    d.status === "published"
                      ? "text-green-600"
                      : d.status === "generated"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {d.status || "unknown"}
                </span>
              </p>
              <button
                onClick={() => handlePublish(d._id)}
                disabled={d.status === "published"}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
