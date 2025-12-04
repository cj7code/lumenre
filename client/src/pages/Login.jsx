// Login.jsx — Login page for Lumenre
// Handles user login, role-based redirect, and saves token/user info in localStorage

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; // Axios instance pre-configured with baseURL

export default function Login() {
  // 🎯 State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🚦 React Router navigate function
  const nav = useNavigate();

  // 🔑 Form submit handler
  async function submit(e) {
    e.preventDefault(); // Prevent page reload

    try {
      // 📨 Send login request to backend
      const res = await api.post('/api/auth/login', { email, password });

      // ✅ Save JWT token and user info locally
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // 💬 Notify user of successful login
      alert(`You are logged in as ${res.data.user.name} (${res.data.user.role})`);

      // 🔄 Role-based redirect after login
      const role = res.data.user.role;
      if (role === 'admin') nav('/admin');       // Admin dashboard
      else if (role === 'tutor') nav('/tutor'); // Tutor dashboard
      else if (role === 'student') nav('/student'); // Student dashboard
      else nav('/');                             // Fallback to homepage

    } catch (err) {
      // ❌ Show error if login fails
      alert(err?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-primary mb-4">Lumenre — Login</h1>

      {/* Login form */}
      <form onSubmit={submit} className="space-y-3">
        {/* Email input */}
        <input 
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />

        {/* Password input */}
        <input 
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
        />

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          {/* Login button */}
          <button className="px-4 py-2 bg-primary text-white rounded">
            Login
          </button>

          {/* Link to signup page */}
          <Link to="/signup" className="text-sm text-teal-800">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}
