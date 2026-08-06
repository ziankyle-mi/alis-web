'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, ArrowLeft, KeyRound, User as UserIcon, Camera, Trash2, ShieldCheck } from 'lucide-react';

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

export default function StudentSettingsPage() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setProfilePic(data.user.profilePicture || null);
      }
    } catch {
      addToast('error', 'Fetch Error', 'Failed to load user profile details.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('error', 'File Too Large', 'Please select an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/user/profile-picture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profilePicture: base64Data }),
        });

        if (!res.ok) {
          addToast('error', 'Upload Failed', 'Could not update profile picture.');
        } else {
          setProfilePic(base64Data);
          addToast('success', 'Profile Picture Updated!', 'New avatar image saved.');
        }
      } catch {
        addToast('error', 'Network Error', 'Failed to save profile picture.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const res = await fetch('/api/user/profile-picture', { method: 'DELETE' });
      if (!res.ok) {
        addToast('error', 'Remove Failed', 'Could not remove profile picture.');
      } else {
        setProfilePic(null);
        addToast('success', 'Picture Removed', 'Reset back to default initials avatar.');
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to remove picture.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('error', 'Missing Information', 'Please complete all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('error', 'Mismatch Error', 'New passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
      addToast('error', 'Password Length', 'New password must be at least 4 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast('error', 'Password Update Failed', data.error || 'Failed to update password.');
      } else {
        addToast('success', 'Password Changed!', 'Your account password has been updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      addToast('error', 'Network Failure', 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header user={user} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8">
        {/* Navigation Bar */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/student"
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-all shadow-sm flex items-center space-x-2 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center space-x-2">
              <Settings className="w-7 h-7 text-[#10312B]" />
              <span>Account Settings & Profile</span>
            </h1>
            <p className="text-xs text-gray-500">Update profile avatar image and manage account security password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card & Avatar Upload (Matching student_settings.py) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
              {/* Circular Avatar with Emerald Ring */}
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-[#10B981] p-1 shadow-lg bg-emerald-50 mb-4 group">
                <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#10312B] text-white font-extrabold text-3xl">
                  {profilePic ? (
                    <Image src={profilePic} alt={user?.name || 'User'} fill className="object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <label className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <Camera className="w-8 h-8" />
                  <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
                </label>
              </div>

              <h3 className="text-lg font-extrabold text-gray-900 mb-1">{user?.name}</h3>
              <p className="text-xs font-mono text-gray-500 mb-1">ID: {user?.studentId || 'STU-7777'}</p>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                {user?.program || 'Computer Science'}
              </span>
            </div>

            <div className="w-full space-y-2 pt-6">
              <label className="w-full py-2.5 bg-[#10312B] hover:bg-[#1b5349] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center space-x-2 cursor-pointer">
                <Camera className="w-4 h-4" />
                <span>Upload New Picture</span>
                <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
              </label>

              {profilePic && (
                <button
                  onClick={handleRemoveProfilePicture}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all border border-red-200 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Picture</span>
                </button>
              )}
            </div>
          </div>

          {/* Account Details & Change Password Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Account Info Panel */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2 border-b pb-3">
                <UserIcon className="w-5 h-5 text-[#10312B]" />
                <span>Account Information</span>
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Username Handle</span>
                  <p className="font-mono font-bold text-gray-900 text-sm">@{user?.username}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Email Address</span>
                  <p className="font-bold text-gray-900 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2 border-b pb-4 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#10312B]" />
                <span>Change Password</span>
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#10312B] hover:bg-[#1b5349] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all disabled:opacity-40"
                  >
                    {loading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
