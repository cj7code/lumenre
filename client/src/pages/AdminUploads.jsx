// ============================================================================
// AdminUploads.jsx
// ---------------------------------------------------------------------------
// ADMIN-ONLY FILE MANAGER
//
// Key guarantees (DO NOT BREAK):
// ✓ Files NEVER auto-download or auto-open on render
// ✓ Files are fetched / opened ONLY after explicit user click
// ✓ Uploading new files does NOT trigger existing files
// ✓ Download counter increments only on intentional open
//
// IMPORTANT:
// - Never render <img src={file.url}> or <iframe src={file.url}> by default
// - Browsers auto-fetch src URLs, which causes auto-download bugs
// ============================================================================

import { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import CourseModuleSelector from "../components/CourseModuleSelector";

export default function AdminUploads() {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [moduleId, setModuleId] = useState("");
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Holds a file explicitly selected for preview
  // This prevents auto-loading previews during list render
  const [previewFile, setPreviewFile] = useState(null);

  // -------------------------------------------------------------------------
  // LOAD FILES FOR MODULE
  // -------------------------------------------------------------------------
  const loadFiles = async () => {
    if (!moduleId) return alert("Select a module first");

    try {
      setLoadingFiles(true);
      const res = await api.get(`/api/admin/modules/${moduleId}/files`);
      setFiles(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load files");
    } finally {
      setLoadingFiles(false);
    }
  };

  // -------------------------------------------------------------------------
  // MULTI-FILE UPLOAD
  // -------------------------------------------------------------------------
  const uploadFile = async () => {
    if (!moduleId || filesToUpload.length === 0)
      return alert("Select module + files");

    const fd = new FormData();
    filesToUpload.forEach((f) => fd.append("files", f));

    try {
      setUploading(true);
      await api.post(`/api/admin/modules/${moduleId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Upload successful");

      // Reset file input + refresh list
      setFilesToUpload([]);
      loadFiles();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // -------------------------------------------------------------------------
  // OPEN FILE (INTENTIONAL ACTION ONLY)
  // -------------------------------------------------------------------------
  // IMPORTANT:
  // - This function is ONLY called on explicit user click
  // - We increment download stats here
  // - We then open the file in a new tab
  //
  // Never auto-call this during render.
  // -------------------------------------------------------------------------
  const openFile = async (file) => {
    try {
      await api.post(
        `/api/admin/modules/${moduleId}/files/${encodeURIComponent(
          file.public_id
        )}/download`
      );
    } catch (err) {
      console.error("Failed to increment downloads", err);
      // Do NOT block viewing if analytics fail
    }

    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  // -------------------------------------------------------------------------
  // DELETE FILE
  // -------------------------------------------------------------------------
  const removeFile = async (publicId) => {
    if (!window.confirm("Delete this file?")) return;

    try {
      await api.delete(
        `/api/admin/modules/${moduleId}/files/${encodeURIComponent(publicId)}`
      );
      alert("Deleted");
      loadFiles();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin — File Manager</h1>

        <Link
          to="/admin"
          className="text-sm text-primary underline hover:no-underline"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* MODULE SELECTOR + UPLOAD */}
      <div className="p-4 bg-white shadow rounded space-y-4">
        <CourseModuleSelector
          value={moduleId}
          onChange={(val) => {
            setModuleId(val);
            if (val) loadFiles();
          }}
        />

        <input
          type="file"
          multiple
          onChange={(e) => setFilesToUpload([...e.target.files])}
          className="block"
        />

        <button
          onClick={uploadFile}
          disabled={uploading}
          className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload Files"}
        </button>

        <button
          onClick={loadFiles}
          className="bg-gray-600 text-white px-4 py-2 rounded ml-2"
        >
          {loadingFiles ? "Refreshing..." : "Refresh List"}
        </button>
      </div>

      {/* FILE LIST */}
      <div>
        {files.length === 0 && !loadingFiles && (
          <p>No files for this module yet.</p>
        )}

        {files.map((file) => (
          <div
            key={file.public_id}
            className="p-4 border rounded mb-3 shadow-sm bg-white"
          >
            {/* File name (does NOT auto-open) */}
            <button
              onClick={() => setPreviewFile(file)}
              className="text-primary underline block text-left"
            >
              {file.originalName}
            </button>

            {/* Explicit open action */}
            <button
              onClick={() => openFile(file)}
              className="text-sm underline mt-2"
            >
              Open in new tab
            </button>

            <p className="text-xs mt-1 text-gray-600">
              Downloads: <b>{file.downloads || 0}</b>
            </p>

            <p className="text-xs text-gray-500 break-all">{file.type}</p>

            <button
              onClick={() => removeFile(file.public_id)}
              className="text-red-600 text-sm underline mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ON-DEMAND PREVIEW (NO AUTO-FETCH) */}
      {previewFile && (
        <div className="border p-4 rounded bg-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{previewFile.originalName}</h3>
            <button
              onClick={() => setPreviewFile(null)}
              className="text-sm underline"
            >
              Close preview
            </button>
          </div>

          {/* PDF preview ONLY after explicit click */}
          {previewFile.type === "application/pdf" ? (
            <object
              data={previewFile.url}
              type="application/pdf"
              className="w-full h-[400px]"
            />
          ) : (
            <p className="text-sm text-gray-600">
              Preview not available. Click “Open in new tab” to view.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
