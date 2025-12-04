// src/components/SlideViewer.jsx
import React, { useState } from "react";

/**
 * SlideViewer Component
 * ------------------------------------------------------------
 * Props:
 *   slides: [ { title: string, content: string } ]
 *   onClose?: fn  (optional callback for tutor preview modal)
 *
 * Features:
 *   ✓ 3D card-style slide display
 *   ✓ Next / Previous navigation
 *   ✓ Progress indicator
 *   ✓ Responsive layout
 *   ✓ Smooth transitions
 * ------------------------------------------------------------
 */
export function SlideViewer({ slides = [], onClose = null }) {
  const [index, setIndex] = useState(0);

  if (!slides || slides.length === 0) return <p>No slides available.</p>;

  const next = () => { if (index < slides.length - 1) setIndex(index + 1); };
  const prev = () => { if (index > 0) setIndex(index - 1); };

  const slide = slides[index] || {};

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center gap-6">
      <div
        className="w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl"
        style={{ perspective: "1000px" }}
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-primary dark:text-teal-300">
            {slide.title || `Slide ${index + 1}`}
          </h2>

          <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
            {slide.content}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={prev} disabled={index === 0}
          className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 disabled:opacity-40">Previous</button>

        <span className="text-sm text-gray-600 dark:text-gray-300">{index + 1} / {slides.length}</span>

        <button onClick={next} disabled={index === slides.length - 1}
          className="px-4 py-2 rounded-lg bg-primary text-white dark:bg-teal-500 disabled:opacity-40">Next</button>

        {onClose && (
          <button onClick={onClose} className="ml-3 text-sm text-red-600 underline">Close</button>
        )}
      </div>
    </div>
  );
}

export default SlideViewer;
