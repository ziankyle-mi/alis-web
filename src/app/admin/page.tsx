'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import BackgroundSlider from '@/components/BackgroundSlider';
import { BookOpen, Users, QrCode, DollarSign, Info, BarChart3, Clock } from 'lucide-react';

interface User {
  name: string;
  role: string;
  email: string;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState('Good day,');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good morning,');
      else if (hour < 17) setGreeting('Good afternoon,');
      else setGreeting('Good evening,');

      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, []);

  const MODULES = [
    {
      title: 'Books Inventory',
      desc: 'Add, update, or remove books from the library catalog (500 items).',
      href: '/admin/inventory',
      icon: BookOpen,
      imageFile: '/images/healtheworld.png',
      badge: '500 Books',
    },
    {
      title: 'Student Borrowing',
      desc: 'Manage checkouts, QR claim verifications, returns, and lost item penalties.',
      href: '/admin/borrowing',
      icon: QrCode,
      imageFile: '/images/bookborrow1.png',
      badge: 'Active Loans',
    },
    {
      title: 'User Management',
      desc: 'Control admin access, manage 42 student accounts, and approve password resets.',
      href: '/admin/users',
      icon: Users,
      imageFile: '/images/usermanagement.png',
      badge: '42 Members',
    },
    {
      title: 'Fine Management',
      desc: 'Track overdue books, custom damage fines, and process payments.',
      href: '/admin/fines',
      icon: DollarSign,
      imageFile: '/images/fine.png',
      badge: '₱5/Day Fee',
    },
    {
      title: 'About System',
      desc: 'Meet the developers, review system specifications, and documentation.',
      href: '/admin/about',
      icon: Info,
      imageFile: '/images/systemsetting.png',
      badge: 'v2.0 Web',
    },
    {
      title: 'Analytics Reports',
      desc: 'View live stats, top borrowers, category breakdown, and export PDF reports.',
      href: '/admin/analytics',
      icon: BarChart3,
      imageFile: '/images/anal.png',
      badge: '4 Charts',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative bg-black select-none font-sans">
      <BackgroundSlider />
      <Header user={user} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center relative z-10">
        {/* Dashboard Title Banner with Live Clock */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-mono mb-3">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentTime || '00:00:00 AM'}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md mb-2">
            {greeting} Administrator.
          </h1>
          <p className="text-gray-200 text-sm md:text-base drop-shadow max-w-lg mx-auto">
            Select a module below to manage the library catalog, borrowing records, and users.
          </p>
        </div>

        {/* 2 Column x 3 Row Module Grid matching maindashboard.py */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
          {MODULES.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group glass-card rounded-3xl p-6 flex items-center space-x-5 hover:bg-white/95 dark:hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl border border-white/50 dark:border-emerald-500/30 relative overflow-hidden"
            >
              <div className="relative w-16 h-16 rounded-2xl bg-white/90 dark:bg-emerald-950/80 p-2.5 flex items-center justify-center shrink-0 border border-gray-200 dark:border-emerald-500/40 group-hover:bg-[#10312B] dark:group-hover:bg-emerald-600 transition-colors shadow-sm">
                <Image
                  src={mod.imageFile}
                  alt={mod.title}
                  width={44}
                  height={44}
                  className="object-contain filter dark:brightness-125 group-hover:brightness-0 group-hover:invert transition-all"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-[#10312B] dark:group-hover:text-emerald-400 transition-colors">
                    {mod.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/90 text-emerald-900 dark:text-emerald-200 text-[10px] font-extrabold uppercase font-mono border border-emerald-300 dark:border-emerald-700">
                    {mod.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
