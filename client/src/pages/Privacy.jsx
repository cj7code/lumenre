// src/pages/Privacy.jsx
import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4 text-[#0a5275]">Privacy Policy</h1>

      <p className="mb-4">
        Lumenre is committed to protecting your personal information. 
        This Privacy Policy explains how we collect, use, and protect your data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Account information (name, email, role)</li>
        <li>Learning progress and quiz attempts</li>
        <li>Device and usage data</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To manage user accounts</li>
        <li>To improve learning features</li>
        <li>To enhance platform performance</li>
        <li>To provide support when needed</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Data Protection</h2>
      <p>Your data is stored securely and never sold to third parties.</p>
    </div>
  );
}
