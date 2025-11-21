// ------------------------------------------------------------
// AdminUploads.jsx — Admin + Tutor Module File Manager
// ------------------------------------------------------------
// Backend endpoints used:
// POST   /api/admin/modules/:moduleId/upload
// GET    /api/admin/modules/:moduleId/files
// DELETE /api/admin/modules/:moduleId/files/:publicId
// ------------------------------------------------------------

import { useState } from "react";
import axios from "../api";

export default function AdminUploads() {
  const [moduleId, setModuleId] = useState("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  // ----------------------------------------------------------
  // Load all uploaded files for the module
  // ----------------------------------------------------------
  const loadFiles = async () => {
    if (!moduleId) return alert("Enter a Module ID first.");

    try {
      const res = await axios.get(`/api/admin/modules/${moduleId}/files`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      setFiles(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load files for this module.");
    }
  };

  // ----------------------------------------------------------
  // Upload file (PDF, PPTX, JPG, DOCX...)
  // ----------------------------------------------------------
  const uploadFile = async () => {
    if (!moduleId || !file) return alert("Select file AND enter a module ID.");

    const fd = new FormData();
    fd.append("file", file);

    try {
      await axios.post(`/api/admin/modules/${moduleId}/upload`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Upload successful!");
      loadFiles();
    } catch (err) {
      console.error(err);
      alert("File upload failed.");
    }
  };

  // ----------------------------------------------------------
  // Delete uploaded file
  // ----------------------------------------------------------
  const removeFile = async (publicId) => {
    if (!window.confirm("Delete this file permanently?")) return;

    try {
      await axios.delete(`/api/admin/modules/${moduleId}/files/${publicId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      alert("File deleted.");
      loadFiles();
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  };

  // ----------------------------------------------------------
  // RENDER COMPONENT
  // ----------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Admin File Manager</h1>

      {/* Module & File Upload */}
      <div className="p-5 bg-white shadow rounded space-y-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="Enter Module ID (e.g. 675fbdbf6c1...)"
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
        />

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <div className="flex gap-3 mt-2">
          <button
            onClick={uploadFile}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
          >
            Upload File
          </button>

          <button
            onClick={loadFiles}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Load Files
          </button>
        </div>
      </div>

      {/* Uploaded Files */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Uploaded Files</h2>

        {files.length === 0 && <p className="text-gray-500">No files uploaded for this module.</p>}

        {files.map((f) => (
          <div
            key={f.public_id}
            className="border p-3 rounded mb-2 flex justify-between items-center bg-white shadow-sm"
          >
            <div>
              <a
                href={f.url}
                target="_blank"
                className="text-blue-600 underline font-medium"
              >
                {f.originalname || f.type || "View File"}
              </a>
              <p className="text-xs text-gray-500">{f.type}</p>
            </div>

            <button
              onClick={() => removeFile(f.public_id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
