// src/components/SlideCarousel.jsx
import React, { useRef, useState, useEffect } from "react";

/**
 * SlideCarousel — a 3D animated carousel with swipe support
 * Props:
 *   slides: [{title, content}]
 *   visible?: number (how many cards to show center + sides)
 */
export function SlideCarousel({ slides = [], visible = 1 }) {
  const [idx, setIdx] = useState(0);
  const containerRef = useRef();

  useEffect(() => { setIdx(0); }, [slides]);

  // simple swipe handling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0;
    let moved = false;
    function onTouchStart(e) { startX = e.touches[0].clientX; moved = false; }
    function onTouchMove(e) { moved = true; }
    function onTouchEnd(e) {
      if (!moved) return;
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      if (diff > 40) setIdx((i) => Math.max(0, i - 1));
      else if (diff < -40) setIdx((i) => Math.min(slides.length - 1, i + 1));
    }
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove", onTouchMove);
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [slides]);

  if (!slides || slides.length === 0) return <p>No slides available.</p>;

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto py-6">
      <div className="relative h-64">
        {slides.map((s, i) => {
          const offset = i - idx;
          const abs = Math.abs(offset);
          const scale = Math.max(0.7, 1 - abs * 0.12);
          const zIndex = slides.length - abs;
          const x = offset * 48; // horizontal shift

          return (
            <div key={i}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-64 rounded-xl bg-white shadow-lg p-4 transition-all duration-400"
              style={{ transform: `translateX(${x}px) translateZ(${ -abs * 50 }px) scale(${scale})`, zIndex }}>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-5 whitespace-pre-line">{s.content}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3 mt-4">
        <button onClick={() => setIdx(i => Math.max(0, i-1))} className="px-3 py-1 rounded bg-gray-200">Prev</button>
        <span className="text-sm text-gray-600">{idx+1} / {slides.length}</span>
        <button onClick={() => setIdx(i => Math.min(slides.length-1, i+1))} className="px-3 py-1 rounded bg-primary text-white">Next</button>
      </div>
    </div>
  );
}

export default SlideCarousel;