// CoursePage
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api.get(`/courses/${id}`).then(r => setCourse(r.data)).catch(() => {});
  }, [id]);

  if (!course) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <div className="space-y-4 mt-4">
        {course.modules?.map(m => (
          <div key={m._id} className="p-3 bg-white rounded shadow">
            <h3 className="font-semibold">{m.title}</h3>
            <p className="text-sm text-slate-600">{m.content?.slice(0, 260) || 'No content yet — admin should add notes.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
