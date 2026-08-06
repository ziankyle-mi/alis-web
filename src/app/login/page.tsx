'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackgroundSlider from '@/components/BackgroundSlider';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import { Eye, EyeOff, AlertTriangle, KeyRound, HelpCircle, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Rate Limiting Lockout State
  const [failCount, setFailCount] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Help Modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Lockout Countdown Timer Effect
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFailCount(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState('CapsLock'));
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (lockoutRemaining > 0) {
      addToast('warning', 'Account Locked Out', `Try again in ${lockoutRemaining} seconds.`);
      triggerShake();
      return;
    }

    if (!identifier.trim() || !password.trim()) {
      addToast('error', 'Missing Information', 'Please enter your username and password.');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const newFails = failCount + 1;
        setFailCount(newFails);

        if (newFails >= 5) {
          setLockoutRemaining(30);
          addToast('error', 'Security Lockout', '5 failed attempts. Locked for 30s.');
        } else {
          addToast('error', 'Authentication Failed', data.error || `Invalid credentials. (${5 - newFails} left)`);
        }
        triggerShake();
      } else {
        addToast('success', 'Authenticated', 'Redirecting to portal...');
        setTimeout(() => {
          router.push(data.redirectUrl);
          router.refresh();
        }, 500);
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to connect to authentication server.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async () => {
    if (forgotStep === 1) {
      if (!resetIdentifier.trim()) {
        addToast('error', 'Input Required', 'Please enter your username or email.');
        return;
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setForgotStep(2);
      addToast('info', 'OTP Verification Code', `Demo Mode OTP: ${otp}`);
    } else if (forgotStep === 2) {
      if (otpInput.trim() !== generatedOtp) {
        addToast('error', 'Invalid Code', 'The 6-digit OTP code is incorrect.');
        return;
      }
      setForgotStep(3);
    } else if (forgotStep === 3) {
      if (!newPassword.trim() || newPassword.length < 4) {
        addToast('error', 'Password Length', 'Password must be at least 4 characters.');
        return;
      }

      try {
        const res = await fetch('/api/password-reset/direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: resetIdentifier, newPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
          addToast('error', 'Reset Failed', data.error || 'Could not update password.');
        } else {
          addToast('success', 'Password Updated', 'Your password has been reset!');
          setShowForgotModal(false);
          setForgotStep(1);
          setResetIdentifier('');
          setOtpInput('');
          setNewPassword('');
        }
      } catch {
        addToast('error', 'Network Failure', 'Failed to connect to server.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-black select-none font-sans">
      <BackgroundSlider />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sleek Minimal Header Bar */}
      <header className="relative z-10 w-full bg-black/30 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-white/10 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="relative w-[220px] sm:w-[260px] h-[34px]">
            <Image src="/images/dlsaulogos1.png" alt="DLSAU Logo" fill className="object-contain object-left" priority />
          </div>
        </div>

        <button
          onClick={() => setShowHelpModal(true)}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 shadow-sm"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Demo Accounts</span>
        </button>
      </header>

      {/* Main Taller & Sleeker Glassmorphism Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-auto">
        <div
          className={`w-full max-w-[380px] min-h-[520px] bg-black/60 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/15 flex flex-col justify-between transition-all duration-300 ${
            isShaking ? 'shake border-red-500/80' : ''
          }`}
        >
          <div>
            {/* Official DLSAU Transparent Header Emblem & Title */}
            <div className="text-center mb-8 pt-2">
              <div className="relative w-48 h-12 mx-auto mb-3">
                <Image
                  src="/images/dlsaulogos1.png"
                  alt="DLSAU Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-lg font-black text-white tracking-tight">Library Management System</h1>
              <p className="text-xs text-emerald-400 font-bold tracking-wider uppercase mt-1">De La Salle Araneta University</p>
            </div>

            {/* Lockout Warning Banner */}
            {lockoutRemaining > 0 && (
              <div className="mb-6 p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center space-x-3 text-red-200 animate-slide-in">
                <Lock className="w-4 h-4 shrink-0 text-red-400" />
                <div className="text-xs">
                  <p className="font-extrabold">Security Lockout</p>
                  <p>Try again in <span className="font-mono font-bold text-white">{lockoutRemaining}s</span></p>
                </div>
              </div>
            )}

            {/* Login Form with Taller Rhythm */}
            <form onSubmit={handleLogin} onKeyDown={handleKeyDown} className="space-y-5">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-300 uppercase tracking-widest mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  placeholder="admin or student"
                  value={identifier}
                  disabled={lockoutRemaining > 0 || loading}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-40"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-extrabold text-gray-300 uppercase tracking-widest">
                    Password
                  </label>
                  {capsLock && (
                    <span className="text-[10px] text-amber-400 font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>CAPS ON</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    disabled={lockoutRemaining > 0 || loading}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-10 disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={lockoutRemaining > 0 || loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-[#10312B] hover:from-emerald-500 hover:to-[#1b5349] text-white font-extrabold text-xs rounded-2xl shadow-xl transition-all disabled:opacity-40 flex items-center justify-center space-x-2 border border-emerald-400/30 group"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>SIGN IN TO PORTAL</span>
                    <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center pt-6 text-[10px] text-gray-400 font-mono">
            SECURE SHA-256 AUTHENTICATION
          </div>
        </div>
      </main>

      {/* Sleek Minimal Footer */}
      <footer className="relative z-10 w-full py-3 text-center text-xs text-white/40 bg-black/40 backdrop-blur-xs">
        &copy; {new Date().getFullYear()} De La Salle Araneta University. All rights reserved.
      </footer>

      {/* Demo Credentials Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/15 rounded-3xl max-w-xs w-full p-6 text-left text-white shadow-2xl animate-scale-up">
            <h3 className="text-sm font-extrabold text-emerald-400 mb-1 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Demo Accounts</span>
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">Use any of the seeded credentials below:</p>

            <div className="space-y-3 mb-6 text-xs">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="font-bold text-emerald-300 text-xs mb-1">🔑 Admin Account</p>
                <p className="text-gray-300 text-[11px]">User: <code className="text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">admin</code></p>
                <p className="text-gray-300 text-[11px] mt-0.5">Pass: <code className="text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">admin123</code></p>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="font-bold text-blue-300 text-xs mb-1">🎓 Student Account</p>
                <p className="text-gray-300 text-[11px]">User: <code className="text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">student</code></p>
                <p className="text-gray-300 text-[11px] mt-0.5">Pass: <code className="text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">student123</code></p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-[#10312B] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/15 rounded-3xl max-w-xs w-full p-6 text-left text-white shadow-2xl animate-scale-up">
            <h3 className="text-sm font-extrabold text-white mb-0.5">Reset Password</h3>
            <p className="text-[10px] text-gray-400 mb-4">Step {forgotStep} of 3</p>

            {forgotStep === 1 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">Username or Email</label>
                <input
                  type="text"
                  placeholder="e.g. admin or student"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500"
                />
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-2">
                <p className="text-xs text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/30 font-mono text-center">
                  [DEMO OTP]: {generatedOtp}
                </p>
                <label className="block text-xs font-bold text-gray-300">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-center text-sm font-mono text-white tracking-widest"
                />
              </div>
            )}

            {forgotStep === 3 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">New Password</label>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500"
                />
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep(1);
                }}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotSubmit}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
              >
                {forgotStep === 3 ? 'Save' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
