'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Info, Code, ShieldCheck, Cpu } from 'lucide-react';

interface User {
  name: string;
  role: string;
  email: string;
}

export default function AboutPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  const DEVELOPERS = [
    {
      name: 'Manuel Zian Kyle Piangco',
      role: 'Lead Documentation & Code',
      imageFile: '/images/ziankyle.png',
      tag: 'Docs & Code',
    },
    {
      name: 'Joshua Enriquez',
      role: 'Full Stack & Backend',
      imageFile: '/images/joshuatorpe.png',
      tag: 'Backend',
    },
    {
      name: 'Huan Marzan',
      role: 'Full Stack Developer',
      imageFile: '/images/huanone.png',
      tag: 'Full Stack/UI/UX',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/admin"
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-all shadow-sm flex items-center space-x-2 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center space-x-2">
              <Info className="w-7 h-7 text-[#10312B]" />
              <span>About & System Specifications</span>
            </h1>
            <p className="text-xs text-gray-500">DLSAU ALIW Library Management System - Version 2.0 Web Edition</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Hero Overview Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative w-56 h-24 shrink-0">
              <Image src="/images/dlsaulogos1.png" alt="DLSAU Logo" fill className="object-contain" priority />
            </div>
            <div>
              <div className="text-xs font-mono text-[#10B981] font-bold mb-1">// DLSAU LIBRARY SYSTEM : V2.0 WEB EDITION</div>
              <h2 className="text-2xl font-extrabold text-[#10312B] mb-2">De La Salle Araneta University Library System</h2>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                The ALIW Library Management System connects students and librarians with real-time digital catalog browsing, 
                cart-based QR borrowing passes, fine tracking, instant PDF statements, and live analytics reports.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-[#10312B]/10 text-[#10312B] rounded-full font-bold">Next.js 16 Web Edition</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">Prisma ORM & SQLite</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold">Tailwind CSS & Recharts</span>
              </div>
            </div>
          </div>

          {/* System Technical Specifications */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#10312B]" />
              <span>System Specifications & Security</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-extrabold text-gray-900 mb-1">🔐 Password Hashing</p>
                <p className="text-gray-600">PBKDF2 SHA-256 (100,000 iterations + Salt) matching legacy Python database parity.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-extrabold text-gray-900 mb-1">📱 QR Pass Technology</p>
                <p className="text-gray-600">Encrypted SVG digital QR passes for instant counter checkout and claim verification.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-extrabold text-gray-900 mb-1">📚 Open Library Cover API</p>
                <p className="text-gray-600">Dynamic Open Library & Google Books API proxy fetching live book covers by title.</p>
              </div>
            </div>
          </div>

          {/* Developer Cards Section matching legacy aboutsection.py */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Code className="w-6 h-6 text-[#10312B]" />
              <h2 className="text-xl font-extrabold text-[#111827]">Meet The Developers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DEVELOPERS.map((dev) => (
                <div
                  key={dev.name}
                  className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  {/* Circular Avatar with Emerald Ring matching aboutsection.py */}
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#10B981] p-1 mb-5 shadow-lg group-hover:scale-105 transition-transform bg-emerald-50">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={dev.imageFile}
                        alt={dev.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-emerald-50 text-[#10B981] rounded-full text-xs font-mono font-bold mb-2 border border-emerald-200">
                    {dev.tag}
                  </span>

                  <h3 className="text-base font-extrabold text-gray-900 mb-1">{dev.name}</h3>
                  <p className="text-xs text-gray-500 font-semibold">{dev.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
