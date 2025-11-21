// src/pages/Contact.jsx
import React from "react";

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto p-6 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4 text-[#0a5275]">Contact Support</h1>

      <p className="mb-6">
        Need help? Have a question or suggestion?  
        Our support team is here to assist you.
      </p>

      <form className="bg-white shadow p-6 rounded space-y-4">

        <div>
          <label className="block font-semibold mb-1">Your Name</label>
          <input className="w-full border p-2 rounded" placeholder="Enter your name" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input className="w-full border p-2 rounded" placeholder="Enter your email" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Message</label>
          <textarea className="w-full border p-2 rounded" rows="4" placeholder="How can we help you?" />
        </div>

        <button className="bg-[#0a5275] hover:bg-[#08405b] text-white px-4 py-2 rounded">
          Submit
        </button>

      </form>
    </div>
  );
}
