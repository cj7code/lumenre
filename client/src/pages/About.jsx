// src/pages/About.jsx
import React from "react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-6 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4 text-[#0a5275]">About Lumenre</h1>

      <p className="mb-4">
        <strong>Lumenre</strong> is a modern digital learning platform built to empower 
        nursing students and educators through highly accessible, interactive, 
        and intuitive learning tools.
      </p>

      <p className="mb-4">
        Our mission is to bridge the gap between traditional classroom teaching 
        and the modern learner. We provide tools that make studying easier, 
        self-paced, and more engaging — from structured course notes to quizzes 
        and offline access features.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Our Vision</h2>
      <p className="mb-4">
        To become Africa’s leading digital companion for nursing education, 
        improving competency, confidence, and examination success.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">What We Offer</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Well-structured course notes for all nursing topics</li>
        <li>Interactive quizzes to reinforce learning</li>
        <li>Offline sync for learning anywhere</li>
        <li>Role-based dashboards for Admins, Tutors, and Students</li>
        <li>Clean, modern and user-friendly UI</li>
      </ul>
    </div>
  );
}
