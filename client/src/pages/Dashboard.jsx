// Dashboard page
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Lumenre — Courses</h1>
        <div className="text-sm text-slate-600">Offline-ready • Tailored for Zambian student nurses</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => (
          <div key={c._id} className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold text-lg">{c.title}</h2>
            <p className="text-sm text-slate-500">Year {c.year} • Semester {c.semester}</p>
            <div className="mt-3">
              <Link className="text-primary underline" to={`/course/${c._id}`}>Open course</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
