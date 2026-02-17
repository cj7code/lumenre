// src/components/Footer.jsx
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand dark:bg-slate-900 text-slate-300 py-2 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">

        {/* Branding */}
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold text-white">Lumenre</h2>
          <p className="text-xs text-slate-200">Smart learning made simple.</p>
        </div>

        {/* Links */}
        <ul className="flex flex-wrap justify-center gap-4 text-sm font-medium">
          <li><a href="/about" className="hover:text-teal-300">About</a></li>
          <li><a href="/help" className="hover:text-teal-300">Help Center</a></li>
          <li><a href="/contact" className="hover:text-teal-300">Contact</a></li>
          <li><a href="/privacy" className="hover:text-teal-300">Privacy</a></li>
          <li><a href="/terms" className="hover:text-teal-300">Terms</a></li>
        </ul>

        {/* Social */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-teal-300"><Facebook size={18} /></a>
          <a href="#" className="hover:text-teal-300"><Twitter size={18} /></a>
          <a href="#" className="hover:text-teal-300"><Instagram size={18} /></a>
          <a href="#" className="hover:text-teal-300"><Github size={18} /></a>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-300 mt-2 mb-1">
        © {new Date().getFullYear()} Lumenre — All Rights Reserved.
      </p>
    </footer>
  );
}
