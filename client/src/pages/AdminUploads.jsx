// Admin-only file manager with preview, multi-upload, delete & view-in-tab

import { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import CourseModuleSelector from "../components/CourseModuleSelector";

export default function AdminUploads() {
  const [moduleId, setModuleId] = useState("");
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Load module files
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

  // Upload multiple files
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
      setFilesToUpload([]);
      loadFiles();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Delete file
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

  // Open file in new tab + increment download counter
  const openFile = async (file) => {
    try {
      await api.post(
        `/api/admin/modules/${moduleId}/files/${encodeURIComponent(
          file.public_id
        )}/download`
      );
    } catch (err) {
      console.error("Failed to increment downloads", err);
      // don't block viewing
    }

    window.open(file.url, "_blank", "noopener,noreferrer");
    // no refresh needed immediately; counter will update next reload
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin — File Manager</h1>

        <Link
          to="/admin"
          className="text-sm text-primary underline hover:no-underline"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>

      {/* Upload Card */}
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

      {/* File List */}
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

// Single file preview card
function FilePreview({ file, onOpen, onDelete }) {
  const isImage = file.type?.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  return (
    <div className="p-4 border rounded mb-3 shadow-sm bg-white">
      <div className="flex items-start justify-between">
        {/* Left: Thumbnail / Preview */}
        <div className="flex items-center gap-4">
          {/* Image Preview */}
          {isImage && (
            <img
              src={file.url}
              alt={file.originalName || ""}
              className="w-20 h-20 object-cover rounded border"
            />
          )}

          {/* PDF Preview (small) */}
          {isPDF && (
            <iframe
              src={file.url}
              className="w-24 h-24 border rounded"
              title={file.originalName || "PDF Preview"}
            />
          )}

          {/* Other documents */}
          {!isImage && !isPDF && (
            <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded text-gray-600 text-xs text-center p-1">
              📄 {file.type?.split("/")[1] || "file"}
            </div>
          )}

          {/* File Info */}
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

            <p className="text-xs text-gray-500 break-all">{file.type}</p>
          </div>
        </div>

        {/* Delete Button */}
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
