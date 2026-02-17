// src/App.jsx
// -----------------------------------------------------------------------------
// Main Application Wrapper
// - Provides global layout structure (header → content → footer)
// - Sticky footer enabled via flex + flex-col + flex-1 pattern
// - All pages routed here using React Router
// -----------------------------------------------------------------------------

import React from "react";
import { Routes, Route } from "react-router-dom";

// Shared Components
import Header from "./components/Header";
import OfflineSync from "./components/OfflineSync";
import Footer from "./components/Footer";
import Layout from "./components/Layout"; // Wraps public pages with consistent spacing

// Sidebar Layouts (Admin & Tutor)
import AdminLayout from "./layouts/AdminLayout";
import TutorLayout from "./layouts/TutorLayout";

// Public Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CoursesListPage from "./pages/CoursesListPage";
import CoursePage from "./pages/CoursePage";
import QuizPage from "./pages/QuizPage";
import QuizListPage from "./pages/QuizListPage";


// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUploads from "./pages/AdminUploads";
import AdminAnalytics from "./pages/AdminAnalytics";

// Tutor Pages
import TutorDashboard from "./pages/TutorDashboard";
// import TutorUploads from "./pages/TutorUploads";

// Student Page
import StudentDashboard from "./pages/StudentDashboard";
import ModuleContentPage from "./pages/ModuleContentPage";
import StudentModuleView from "./pages/StudentModuleView";
import StudentQuiz from "./pages/StudentQuiz";
import StudentCoursePage from "./pages/StudentCoursePage";



// Footer-linked Pages
import About from "./pages/About";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/Privacy";
import Terms from "./pages/Terms";

export default function App() {
  return (
    // -----------------------------------------------------------------------------
    // Root layout (sticky footer enabled)
    // flex-col     → vertical stacking of header → content → footer
    // min-h-screen → makes layout fill entire screen height
    // flex-1       → expands main content to push footer down
    // -----------------------------------------------------------------------------
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* --------------------------------------------------------------- */}
      {/* 🧭 GLOBAL HEADER (always displayed on all pages)                */}
      {/* --------------------------------------------------------------- */}
      <Header />

      {/* --------------------------------------------------------------- */}
      {/* 📡 Offline notification banner                                 */}
      {/* --------------------------------------------------------------- */}
      <OfflineSync />

      {/* --------------------------------------------------------------- */}
      {/* 📘 MAIN CONTENT AREA                                           */}
      {/* flex-1 makes this section grow so the footer stays at bottom   */}
      {/* --------------------------------------------------------------- */}
      <main className="flex-1">
        <Routes>

          {/* ------------------------------------------------------------- */}
          {/* 🌍 PUBLIC ROUTES (wrapped inside <Layout> for consistent UI) */}
          {/* ------------------------------------------------------------- */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><Signup /></Layout>} />

          {/* Courses */}
          <Route path="/courses" element={<Layout><CoursesListPage /></Layout>} />
          <Route path="/courses/:id" element={<Layout><CoursePage /></Layout>} />

          {/* Quizzes */}
          <Route path="/quiz/:id" element={<Layout><QuizPage /></Layout>} />
          <Route path="/quizzes" element={<QuizListPage />} />

          {/* Student Dashboard */}
          <Route path="/student" element={<Layout><StudentDashboard /></Layout>} />

          {/* ------------------------------------------------------------- */}
          {/* 🛡️ ADMIN ROUTES (use AdminLayout with sidebar navigation)    */}
          {/* ------------------------------------------------------------- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="uploads" element={<AdminUploads />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* ------------------------------------------------------------- */}
          {/* 🧑‍🏫 TUTOR ROUTES (TutorLayout with sidebar)                 */}
          {/* ------------------------------------------------------------- */}
          <Route path="/tutor" element={<TutorLayout />}>
            <Route index element={<TutorDashboard />} />
            {/* <Route path="uploads" element={<TutorUploads />} /> */}
            {/* 🔁 REUSE ADMIN PAGES */}
            <Route path="uploads" element={<AdminUploads />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* ------------------------------------------------------------- */}
          {/* 📄 FOOTER EXTRA PAGES (simple public pages)                  */}
          {/* ------------------------------------------------------------- */}
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/help" element={<Layout><Help /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
          <Route path="/terms" element={<Layout><Terms /></Layout>} />

          {/* Module content page (for students + tutors) */}
          <Route path="/modules/:moduleId" element={<ModuleContentPage />} />
          <Route path="/student/module/:moduleId" element={<StudentModuleView />} />
          <Route path="/student/quiz/:quizId" element={<StudentQuiz />} />
          <Route path="/student/course/:courseId" element={<StudentCoursePage />} />

        </Routes>
      </main>

      {/* --------------------------------------------------------------- */}
      {/* 🦶 STICKY FOOTER                                               */}
      {/* Renders once globally — NOT inside individual pages             */}
      {/* Always sits at the bottom due to flex layout above             */}
      {/* --------------------------------------------------------------- */}
      <Footer />

    </div>
  );
}
