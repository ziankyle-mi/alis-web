'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import BackgroundSlider from '@/components/BackgroundSlider';
import { BookOpen, Clock, DollarSign, Settings, User as UserIcon, QrCode } from 'lucide-react';

interface StudentUser {
  id: number;
  name: string;
  username: string;
  email: string;
  studentId: string | null;
  program: string | null;
  role: string;
  profilePicture?: string | null;
}

export default function StudentDashboardPage() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [greeting, setGreeting] = useState('Good day,');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning,');
    else if (hour < 17) setGreeting('Good afternoon,');
    else setGreeting('Good evening,');

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ST';

  const STUDENT_MODULES = [
    {
      title: 'Library Catalog',
      desc: 'Browse available books, add to cart, and generate digital QR borrow passes.',
      href: '/student/catalog',
      imageFile: '/images/healtheworld.png',
      badge: '500 Books',
    },
    {
      title: 'My Borrowings',
      desc: 'Track active book loans, due dates, return history, and request returns.',
      href: '/student/borrowings',
      imageFile: '/images/bookborrow1.png',
      badge: 'Active Loans',
    },
    {
      title: 'My Fines',
      desc: 'Check overdue balances, request payment verification, and download PDF receipts.',
      href: '/student/fines',
      imageFile: '/images/fine.png',
      badge: '₱5/Day Fee',
    },
    {
      title: 'Account Settings',
      desc: 'Update your profile picture, view account details, and change your password.',
      href: '/student/settings',
      imageFile: '/images/systemsetting.png',
      badge: 'Profile',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative bg-black select-none font-sans">
      <BackgroundSlider />
      <Header user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center relative z-10">
        {/* Student Profile Header Bubble matching regulardashboard.py */}
        {user && (
          <div className="glass-card rounded-3xl p-6 mb-8 max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/50 dark:border-emerald-500/30 shadow-2xl">
            <div className="flex items-center space-x-5">
              {/* Circular Profile Avatar */}
              <div className="w-16 h-16 rounded-full bg-[#10312B] text-white flex items-center justify-center font-extrabold text-xl border-4 border-[#10B981] shadow-lg shrink-0 overflow-hidden relative">
                {user.profilePicture ? (
                  <Image src={user.profilePicture} alt={user.name} fill className="object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-mono tracking-wider">
                  STUDENT PORTAL
                </span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {greeting} {firstName}!
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  ID: <span className="font-mono font-bold text-gray-900 dark:text-white">{user.studentId || 'STU-7777'}</span> &bull; Major: <span className="font-bold text-gray-900 dark:text-white">{user.program || 'Computer Science'}</span>
                </p>
              </div>
            </div>

            <Link
              href="/student/catalog"
              className="px-5 py-3 bg-[#10312B] dark:bg-emerald-600 hover:bg-[#1b5349] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 shrink-0"
            >
              <BookOpen className="w-4 h-4 text-emerald-300 dark:text-emerald-950" />
              <span>Browse Catalog Books</span>
            </Link>
          </div>
        )}

        {/* 2 Column x 2 Row Student Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {STUDENT_MODULES.map((mod) => (
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
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/90 text-emerald-900 dark:text-emerald-200 text-[10px] font-extrabold uppercase font-mono border border-emerald-300 dark:border-emerald-700">
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
