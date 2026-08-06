'use client';

import { useState, useEffect } from 'react';

const BACKGROUND_IMAGES = [
  '/images/outside.png',
  '/images/outside3.png',
  '/images/outside2.png',
  '/images/forest.png',
  '/images/login1pic.png',
];

export default function BackgroundSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-none bg-black">
      {BACKGROUND_IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out transform scale-105 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url("${src}")` }}
        />
      ))}
      {/* Rich Cinematic Overlay matching legacy Python background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 backdrop-blur-[4px]" />
    </div>
  );
}
