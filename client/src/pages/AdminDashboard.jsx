// Admin page
import { useState, useEffect } from 'react';
import axios from '../api';

export default function AdminDashboard() {
  const [modules, setModules] = useState([]);
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    axios.get('/courses').then(res => setModules(res.data));
  }, []);

  const handleFileUpload = async (moduleId) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');

    const res = await axios.post(`/admin/module/${moduleId}/upload`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert(res.data.message);
  };

  const handleAIGenerate = async (moduleId) => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/admin/module/${moduleId}/ai-generate`, { content }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert(res.data.message);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {modules.map(m => (
        <div key={m._id}>
          <h2>{m.title}</h2>
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <button onClick={() => handleFileUpload(m._id)}>Upload File</button>
          <textarea placeholder="Raw content for AI" onChange={e => setContent(e.target.value)} />
          <button onClick={() => handleAIGenerate(m._id)}>Generate AI Notes/Quizzes</button>
        </div>
      ))}
    </div>
  );
}
