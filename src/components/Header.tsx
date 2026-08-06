'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Menu, X, ChevronDown, Moon, Sun, Home } from 'lucide-react';

interface HeaderProps {
  user?: {
    name: string;
    role: string;
    email: string;
    studentId?: string | null;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('alis_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('alis_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('alis_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const navHome = () => {
    if (!user) return router.push('/login');
    router.push(user.role === 'ADMIN' ? '/admin' : '/student');
  };

  return (
    <header className="w-full bg-[#10312B] dark:bg-[#071714] h-16 px-4 md:px-8 flex items-center justify-between text-white shadow-md relative z-30 border-b border-emerald-900/40 transition-colors">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={navHome}>
        <div className="relative w-[220px] sm:w-[280px] h-[38px]">
          <Image
            src="/images/dlsaulogos1.png"
            alt="DLSAU Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Dark / Light Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 transition-all border border-white/10 flex items-center justify-center shadow-sm"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-300" />}
        </button>

        {/* Desktop User Navigation */}
        {user && (
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={navHome}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all border border-white/10"
            >
              <Home className="w-3.5 h-3.5 text-emerald-300" />
              <span>Dashboard</span>
            </button>

            {/* User Profile Pill Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-[#1b5349] dark:bg-emerald-900/60 hover:bg-[#256a5e] px-3.5 py-1.5 rounded-full border border-emerald-400/30 transition-all shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-emerald-100">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="font-bold text-xs">{user.name}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-900 font-mono tracking-wider text-emerald-200">
                  {user.role}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl py-2 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800 animate-scale-up z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-extrabold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        {user && (
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-white hover:bg-emerald-800/60 rounded-xl transition-colors"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && user && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-[#10312B] dark:bg-[#071714] border-b border-emerald-800 p-4 space-y-3 z-40 shadow-xl animate-slide-in">
          <div className="p-3 bg-[#1b5349] dark:bg-emerald-950 rounded-xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-sm font-bold">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-emerald-200">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowMobileMenu(false);
              navHome();
            }}
            className="w-full text-left py-2.5 px-4 bg-white/10 rounded-xl text-xs font-bold text-white flex items-center space-x-2"
          >
            <Home className="w-4 h-4 text-emerald-300" />
            <span>Go to Dashboard</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-left py-2.5 px-4 bg-red-600/80 hover:bg-red-600 rounded-xl text-xs font-bold text-white flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
