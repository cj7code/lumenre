// src/components/TutorUploads.jsx
import { useState } from "react";
import api from "../api";

export default function TutorUploads() {
  const [moduleId, setModuleId] = useState("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    if (!moduleId) return alert("Enter module ID first");

    try {
      const res = await api.get(`modules/${moduleId}/files`);   // ✅ FIXED
      setFiles(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load files");
    }
  };

  const uploadFile = async () => {
    if (!file) return alert("Select a file");
    if (!moduleId) return alert("Enter module ID");

    const fd = new FormData();
    fd.append("file", file);

    try {
      await api.post(
        `modules/${moduleId}/upload`,     // ✅ FIXED
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Uploaded!");
      loadFiles();
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    }
  };

  return (
    <section className="bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Module File Uploads</h2>

      <input
        className="border p-2 rounded w-full"
        placeholder="Module ID"
        value={moduleId}
        onChange={(e) => setModuleId(e.target.value)}
      />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <div className="flex gap-2">
        <button
          onClick={uploadFile}
          className="bg-primary text-white p-2 rounded"
        >
          Upload
        </button>

        <button
          onClick={loadFiles}
          className="bg-gray-700 text-white p-2 rounded"
        >
          Refresh
        </button>
      </div>

      <div>
        {files.length === 0 && <p>No files yet.</p>}

        {files.map((f) => (
          <div key={f.public_id} className="border p-3 rounded mb-2">
            <a
              href={f.url}
              target="_blank"
              className="underline text-primary"
            >
              {f.original_filename || "View file"}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
