// src/pages/Help.jsx
import React from "react";

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto p-6 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4 text-[#0a5275]">Help Center</h1>

      <p className="mb-6">
        Welcome to the Lumenre Help Center. Here you will find answers to common 
        questions and guidance on how to navigate the platform.
      </p>

      <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">How do I access courses?</h3>
          <p>Click on the “Courses” tab in the navigation menu to view all available courses.</p>
        </div>

        <div>
          <h3 className="font-semibold">Can I learn offline?</h3>
          <p>
            Yes! Lumenre automatically syncs key data so you can continue studying 
            even when offline.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">How do I reset my password?</h3>
          <p>
            Currently, password reset is supported manually. Contact Support for assistance.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">How do I contact support?</h3>
          <p>Use the “Contact Support” page to reach us directly.</p>
        </div>
      </div>
    </div>
  );
}
