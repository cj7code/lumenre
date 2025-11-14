// Landing page — Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  // ✅ Fetch courses from backend
  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses", err));
  }, []);

  // ✅ Get logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  // ✅ Role-based dashboard redirect button
  const goToDashboard = () => {
    if (!user) return nav('/login');
    if (user.role === 'admin') nav('/admin');
    else if (user.role === 'tutor') nav('/tutor');
    else nav('/student');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Hero section */}
      <section className="bg-[#0a5275] text-white rounded-lg p-8 mb-6 shadow-md">
        <h1 className="text-3xl font-bold mb-2">Welcome to Lumenre</h1>
        <p className="mb-4">Offline-ready platform tailored for Zambian student nurses.</p>
        {user ? (
          <button
            onClick={goToDashboard}
            className="bg-white text-primary font-semibold px-4 py-2 rounded hover:bg-gray-100"
          >
            Go to your dashboard ({user.role})
          </button>
        ) : (
          <div className="space-x-2">
            <Link
              to="/login"
              className="bg-white text-primary font-semibold px-4 py-2 rounded hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-teal-600 text-white font-semibold px-4 py-2 rounded hover:bg-teal-700"
            >
              Sign Up
            </Link>
          </div>
        )}
      </section>

      {/* Courses section */}
      <section>
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Available Courses</h2>
          <span className="text-sm text-slate-500">{courses.length} courses available</span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => (
            <div key={c._id} className="p-4 bg-white rounded shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-lg">{c.title}</h3>
              <p className="text-sm text-slate-500">Year {c.year} • Semester {c.semester}</p>
              <div className="mt-3">
                <Link className="text-primary underline" to={`/course/${c._id}`}>
                  Open course
                </Link>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-gray-500">No courses available at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}
