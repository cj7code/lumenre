// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// ✅ Components
import Header from "./components/Header";
import OfflineSync from "./components/OfflineSync";

// ✅ Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";        // Landing page
import CoursePage from "./pages/CoursePage";
import QuizPage from "./pages/QuizPage";

// ✅ Role-based Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ✅ Top navigation bar visible on all pages */}
      <Header />

      {/* ⚡ Offline alert banner */}
      <OfflineSync />

      {/* 📚 App Routes */}
      <Routes>
        {/* ✅ Public / Landing pages */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses/:id" element={<CoursePage />} />
        <Route path="/quiz/:id" element={<QuizPage />} />

        {/* ✅ Role-based dashboards */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/tutor" element={<TutorDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </div>
  );
}
