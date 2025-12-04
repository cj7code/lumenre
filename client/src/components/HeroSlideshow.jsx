// HeroSlideshow.jsx — auto-slideshow background for hero section

import React, { useEffect, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1580281658626-7b4df87546d8?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1580281657521-6a8c5ae9ef9a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1583912372040-980ccf327cd9?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600959907703-125ba1374a09?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1576765607924-26112b4ff2bf?auto=format&fit=crop&w=1600&q=80",
];

export default function HeroSlideshow({ children }) {
  const [index, setIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-[260px] md:h-[300px] overflow-hidden rounded-b-3xl shadow-lg">
      {/* Background Images */}
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ${
            index === i ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/60" />

      {/* Center content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {children}
      </div>
    </div>
  );
}
