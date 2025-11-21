// TutorUploads.jsx — Tutors can upload and view files
import { useState } from "react";
import axios from "../api";

export default function TutorUploads() {
  const [moduleId, setModuleId] = useState("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    try {
      const res = await axios.get(`/api/tutor/uploads/${moduleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setFiles(res.data);
    } catch (e) {
      alert("Failed to load files");
    }
  };

  const uploadFile = async () => {
    if (!file || !moduleId) return alert("Enter module + choose file");

    const fd = new FormData();
    fd.append("file", file);

    try {
      await axios.post(`/api/tutor/uploads/${moduleId}`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Upload complete!");
      loadFiles();
    } catch (e) {
      alert("Upload failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-4">Tutor Upload Panel</h1>

      <div className="p-4 bg-white rounded shadow space-y-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="Module ID"
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
        />

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button onClick={uploadFile} className="bg-primary text-white p-2 rounded">
          Upload File
        </button>

        <button onClick={loadFiles} className="bg-gray-700 text-white p-2 rounded ml-2">
          Refresh List
        </button>
      </div>

      <div className="mt-4">
        {files.map((f) => (
          <div key={f.public_id} className="border p-3 rounded mb-2">
            <a href={f.url} target="_blank" className="text-primary underline">
              View {f.type}
            </a>
          </div>
        ))}
        {files.length === 0 && <p>No files uploaded yet.</p>}
      </div>
    </div>
  );
}
