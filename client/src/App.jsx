// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// ✅ Components
import Header from "./components/Header";
import OfflineSync from "./components/OfflineSync";
import Footer from "./components/Footer";
import Layout from "./components/Layout"; // Wrap pages for theme/footer/back-to-top

// ✅ Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";           // Landing page
import CoursesListPage from "./pages/CoursesListPage"; // All courses
import CoursePage from "./pages/CoursePage";           // Single course
import QuizPage from "./pages/QuizPage";
import AdminUsers from "./pages/AdminUsers";
import AdminUploads from "./pages/AdminUploads";
import TutorUploads from "./pages/TutorUploads";



// ✅ Role-based Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// ✅ About, Help, Contact, Privacy, Terms
import About from "./pages/About";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/Privacy";
import Terms from "./pages/Terms";


export default function App() {
  return (
    // ✅ Full height container to support sticky footer
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* ✅ Top navigation bar visible on all pages */}
      <Header />

      {/* ⚡ Offline alert banner */}
      <OfflineSync />

      {/* 📚 Main content flex-grow so footer sticks at bottom */}
      <main className="flex-1">
        <Routes>
          {/* ✅ Public / Landing pages wrapped in Layout */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><Signup /></Layout>} />

          {/* ✅ Courses */}
          <Route path="/courses" element={<Layout><CoursesListPage /></Layout>} />      {/* All courses */}
          <Route path="/courses/:id" element={<Layout><CoursePage /></Layout>} />       {/* Single course */}

          {/* ✅ Quizzes */}
          <Route path="/quiz/:id" element={<Layout><QuizPage /></Layout>} />

          {/* ✅ Role-based dashboards */}
          <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="/tutor" element={<Layout><TutorDashboard /></Layout>} />
          <Route path="/student" element={<Layout><StudentDashboard /></Layout>} />

          {/* ✅ About, Help, Contact, Privacy, Terms */}
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          {/* ✅ Admin Users UI - Admin User*/}
          <Route path="/admin/users" element={<AdminUsers />} />

          {/* ✅ Admin Upload Page*/}
          <Route path="/admin/uploads" element={<AdminUploads />} />

          {/* ✅ Tutor Upload Page*/}
          <Route path="/tutor/uploads" element={<TutorUploads />} />
        </Routes>
      </main>

      {/* ✅ Footer always visible at bottom */}
      <Footer />
    </div>
  );
}
