// src/pages/Terms.jsx
import React from "react";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto p-6 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4 text-[#0a5275]">Terms & Conditions</h1>

      <p className="mb-4">
        By accessing and using Lumenre, you agree to these Terms and Conditions.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Use of Platform</h2>
      <p className="mb-4">
        Users must access the platform responsibly and avoid sharing login
        credentials with others.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Intellectual Property</h2>
      <p className="mb-4">
        All course materials, quizzes, and platform features are protected 
        and may not be redistributed.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Account Termination</h2>
      <p>
        Misuse of the platform may lead to account restriction or termination.
      </p>
    </div>
  );
}
