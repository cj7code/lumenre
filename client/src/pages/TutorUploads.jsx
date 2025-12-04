// ============================================================================
// TutorUploads.jsx
// ----------------------------------------------------------------------------
// Tutor File Manager:
//   ✓ Uses SAME backend upload routes as admin
//   ✓ Allows multi-file upload
//   ✓ Allows deleting files
//   ✓ Inline previews for images + PDFs
//   ✓ Refresh list button
//
// NOTE:
// - <CourseModuleSelector /> allows picking course + module
// - Frontend always sends files as `files` because backend uses .array("files")
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
  // Fetch files for a selected module
  // REUSES: /admin/modules/:moduleId/files
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
  // Upload one or more files (same as AdminUploads)
  // Sends multipart/form-data with key: "files"
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
  // Delete file from Cloudinary + module record
  // Route: /admin/modules/:moduleId/files/:publicId
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Open file in new tab + increment download counter
  // ---------------------------------------------------------------------------
  const openFile = async (file) => {
    try {
      await api.post(
        `/api/admin/modules/${moduleId}/files/${encodeURIComponent(
          file.public_id
        )}/download`
      );
    } catch (err) {
      console.error("Failed to increment downloads", err);
    }

    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Page Title */}
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
            if (val) loadFiles(); // Auto-load files when module changes
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

      {/* File Listing Section */}
      <div>
        {files.length === 0 && !loadingFiles && (
          <p>No files for this module yet.</p>
        )}

        {files.map((file) => (
          <FilePreview
            key={file.public_id}
            file={file}
            onOpen={() => openFile(file)}
            onDelete={() => removeFile(file.public_id)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FilePreview Component
// Shows inline preview for images + PDFs + fallback for other files
// ============================================================================
function FilePreview({ file, onOpen, onDelete }) {
  const isImage = file.type?.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  return (
    <div className="p-4 border rounded mb-3 shadow-sm bg-white">
      <div className="flex items-start justify-between">
        
        {/* Preview block */}
        <div className="flex items-center gap-4">

          {/* Image thumbnail */}
          {isImage && (
            <img
              src={file.url}
              alt={file.originalName || ""}
              className="w-20 h-20 object-cover rounded border"
            />
          )}

          {/* PDF preview */}
          {isPDF && (
            <iframe
              src={file.url}
              className="w-24 h-24 border rounded"
              title={file.originalName || "PDF Preview"}
            />
          )}

          {/* Generic file icon */}
          {!isImage && !isPDF && (
            <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded text-gray-600 text-xs text-center p-1">
              📄 {file.type?.split("/")[1] || "file"}
            </div>
          )}

          {/* Text info */}
          <div>
            <button
              onClick={onOpen}
              className="text-primary underline block text-sm text-left"
            >
              {file.originalName || "Open file"}
            </button>

            <p className="text-xs mt-1 text-gray-600">
              Downloads: <b>{file.downloads || 0}</b>
            </p>

            <p className="text-xs text-gray-500 break-all">
              {file.type}
            </p>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="text-red-600 text-sm underline ml-4"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
