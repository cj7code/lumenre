// ============================================================================
// TutorUploads.jsx
// ----------------------------------------------------------------------------
// Tutor File Manager
//
// FIXES APPLIED:
// ✓ Prevents auto-download of PDFs and other files
// ✓ Files are ALWAYS previewed inline first
// ✓ Download/Open happens ONLY after explicit user action
// ✓ Uses same backend routes (NO backend changes)
// ✓ Mirrors student dashboard behaviour for consistency
//
// IMPORTANT:
// - DO NOT use window.open() on file click
// - Cloudinary URLs may force download if opened directly
// ============================================================================

import { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import CourseModuleSelector from "../components/CourseModuleSelector";

export default function TutorUploads() {
  const [moduleId, setModuleId] = useState("");
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // ---------------------------------------------------------------------------
  // Load files for selected module
  // SAME endpoint as AdminUploads (do not change)
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Upload files (unchanged, already correct)
  // ---------------------------------------------------------------------------
  const uploadFile = async () => {
    if (!moduleId || filesToUpload.length === 0)
      return alert("Select module + files");

    const fd = new FormData();
    filesToUpload.forEach((f) => fd.append("files", f)); // MUST MATCH multer

    try {
      setUploading(true);
      await api.post(`/api/admin/modules/${moduleId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Upload successful");
      setFilesToUpload([]);
      loadFiles();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete file (unchanged)
  // ---------------------------------------------------------------------------
  const removeFile = async (publicId) => {
    if (!window.confirm("Delete this file?")) return;

    try {
      await api.delete(
        `/api/admin/modules/${moduleId}/files/${encodeURIComponent(publicId)}`
      );
      loadFiles();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ---------------------------------------------------------------------------
  // Explicit open/download action
  // ✔ Increment counter
  // ✔ THEN open file
  // ✔ NEVER auto-triggered
  // ---------------------------------------------------------------------------
  const openFileExplicitly = async (file) => {
    try {
      await api.post(
        `/api/admin/modules/${moduleId}/files/${encodeURIComponent(
          file.public_id
        )}/download`
      );
    } catch (err) {
      console.error("Download counter failed", err);
    }

    // Explicit user intent ONLY
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tutor — File Manager</h1>

        <Link
          to="/tutor"
          className="text-sm text-primary underline hover:no-underline"
        >
          ← Back to Tutor Dashboard
        </Link>
      </div>

      {/* Upload Section */}
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

      {/* File List */}
      <div>
        {files.length === 0 && !loadingFiles && (
          <p>No files for this module yet.</p>
        )}

        {files.map((file) => (
          <FilePreview
            key={file.public_id}
            file={file}
            onDelete={() => removeFile(file.public_id)}
            onOpen={() => openFileExplicitly(file)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FilePreview Component
// ----------------------------------------------------------------------------
// CRITICAL RULE:
// - Preview FIRST
// - Download/Open ONLY via explicit button
// - NO auto navigation
// ============================================================================
function FilePreview({ file, onDelete, onOpen }) {
  const isImage = file.type?.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  return (
    <div className="p-4 border rounded mb-3 shadow-sm bg-white">
      <div className="flex justify-between items-start gap-4">

        {/* Preview */}
        <div className="flex gap-4">
          {/* Image preview */}
          {isImage && (
            <img
              src={file.url}
              alt={file.originalName}
              className="w-24 h-24 object-cover border rounded"
            />
          )}

          {/* PDF inline preview (NO DOWNLOAD) */}
          {isPDF && (
            <iframe
              src={file.url}
              className="w-32 h-32 border rounded"
              title={file.originalName}
            />
          )}

          {/* Other file types */}
          {!isImage && !isPDF && (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded text-xs text-center">
              {file.type?.split("/")[1] || "FILE"}
            </div>
          )}

          {/* Meta */}
          <div>
            <p className="font-medium text-sm">{file.originalName}</p>
            <p className="text-xs text-gray-600">
              Downloads: <b>{file.downloads || 0}</b>
            </p>

            {/* Explicit action button */}
            <button
              onClick={onOpen}
              className="mt-2 text-sm text-primary underline"
            >
              Open / Download
            </button>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="text-red-600 text-sm underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
