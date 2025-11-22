// Signup page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState(1);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post('auth/signup', { name, email, password, year });
      localStorage.setItem('token', res.data.token);
      nav('/');
    } catch (err) {
      alert(err?.response?.data?.error || 'Signup failed');
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-4">Create an account</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full p-2 border rounded" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-2 border rounded" />
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="w-full p-2 border rounded">
          <option value={1}>Year 1</option>
          <option value={2}>Year 2</option>
          <option value={3}>Year 3</option>
        </select>
        <button className="px-4 py-2 bg-primary text-white rounded">Create account</button>
      </form>
    </div>
  );
}
