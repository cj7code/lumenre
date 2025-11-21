// src/components/Footer.jsx
// ✔ Updated to remove duplicate header links
// ✔ Added About, Help, Contact, Privacy, Terms
// ✔ Quick links inline (small height)
// ✔ Dark mode supported

import { Facebook, Twitter, Instagram, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a5275] dark:bg-slate-900 text-slate-300 py-2 border-t border-slate-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">

        {/* --- Branding (left side) --- */}
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold text-white">Lumenre</h2>
          <p className="text-xs text-slate-400">Smart learning made simple.</p>
        </div>

        {/* --- Platform Links (Replaces header duplicates) --- */}
        {/* All important legal & info links are now here */}
        <ul className="flex flex-wrap justify-center gap-4 text-sm font-medium">
          <li><a href="/about" className="hover:text-teal-400">About</a></li>
          <li><a href="/help" className="hover:text-teal-400">Help Center</a></li>
          <li><a href="/contact" className="hover:text-teal-400">Contact</a></li>
          <li><a href="/privacy" className="hover:text-teal-400">Privacy Policy</a></li>
          <li><a href="/terms" className="hover:text-teal-400">Terms</a></li>
        </ul>

        {/* --- Social Icons (right side) --- */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-teal-300"><Facebook size={18} /></a>
          <a href="#" className="hover:text-teal-300"><Twitter size={18} /></a>
          <a href="#" className="hover:text-teal-300"><Instagram size={18} /></a>
          <a href="#" className="hover:text-teal-300"><Github size={18} /></a>
        </div>

      </div>

      {/* --- Footer bottom row --- */}
      <p className="text-center text-[11px] text-slate-400 mt-2 mb-1">
        © {new Date().getFullYear()} Lumenre — All Rights Reserved.
      </p>
    </footer>
  );
}
