// src/components/TutorSlidePreview.jsx
import React, { useState } from "react";
import SlideViewer from "./SlideViewer";

/**
 * TutorSlidePreview
 * Small wrapper that opens SlideViewer in a simple modal for tutors
 */
export default function TutorSlidePreview({ slides = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex gap-2">
        <button onClick={() => setOpen(true)} className="px-3 py-1 bg-primary text-white rounded">Preview Slides</button>
        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(slides))} className="px-3 py-1 bg-gray-200 rounded">Copy JSON</button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Slide Preview</h3>
              <button onClick={() => setOpen(false)} className="text-red-600">Close</button>
            </div>
            <SlideViewer slides={slides} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}