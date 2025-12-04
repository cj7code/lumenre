// src/pages/CoursePage.jsx
// ------------------------------------------------------
// Student Course View
// Shows: Course details + module previews (content snippet)
// ------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------
  // LOAD COURSE + POPULATED MODULES
  // ------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    api.get(`/api/courses/${id}`)
      .then((res) => {
        if (!mounted) return;

        // Prevent modules from being overwritten by other requests
        const safeCourse = {
          ...res.data,
          modules: Array.isArray(res.data.modules) ? res.data.modules : []
        };

        setCourse(safeCourse);
      })
      .catch((err) => {
        console.error("COURSE LOAD ERROR:", err);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  // ------------------------------------------------------
  // RENDERING
  // ------------------------------------------------------
  if (loading) {
    return <div className="p-6">Loading course…</div>;
  }

  if (!course) {
    return (
      <div className="p-6 text-red-600">
        Course not found.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* ---------------------------------------------- */}
      {/* COURSE HEADER */}
      {/* ---------------------------------------------- */}
      <header>
        <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {course.code} • Year {course.year} • Semester {course.semester}
        </p>
      </header>

      {/* ---------------------------------------------- */}
      {/* MODULE LIST */}
      {/* ---------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Modules</h2>

        {course.modules.length === 0 && (
          <p classname="text-slate-500 text-sm">
            No modules added for this course yet.
          </p>
        )}

        <div className="space-y-4">
          {course.modules.map((m) => (
            <div
              key={m._id}
              className="p-4 bg-white rounded shadow hover:shadow-md transition cursor-pointer"
            >
              <Link
                to={`/student/module/${m._id}`}
                className="block"
              >
                <h3 className="font-semibold text-lg text-slate-900">
                  {m.title}
                </h3>

                <p className="text-sm text-slate-600 mt-1">
                  {m.content
                    ? m.content.replace(/<[^>]+>/g, "").slice(0, 180) + "..."
                    : "No content yet — admin should add notes."}
                </p>

                {m.attachments?.length > 0 && (
                  <p className="text-xs text-teal-600 mt-2">
                    📎 {m.attachments.length} attachment(s)
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------- */}
      {/* BACK LINK */}
      {/* ---------------------------------------------- */}
      <div className="pt-4">
        <Link to="/courses" className="text-primary underline text-sm">
          ← Back to all courses
        </Link>
      </div>
    </div>
  );
}
