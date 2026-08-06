'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { Users, Search, Plus, UserCheck, UserX, ArrowLeft, KeyRound, Shield } from 'lucide-react';

interface UserRecord {
  id: number;
  name: string;
  username: string;
  email: string;
  studentId: string | null;
  program: string | null;
  role: string;
  status: string;
}

interface ResetRequest {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  requestedAt: string;
}

export default function UserManagementPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'users' | 'resets'>('users');
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    studentId: '',
    program: 'Computer Science',
    role: 'STUDENT',
    password: '',
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, role: roleFilter });
      const res = await fetch(`/api/users?${query}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (data.requests) setResetRequests(data.requests);
    } catch {
      addToast('error', 'Fetch Failure', 'Failed to load user roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user));
    fetchUsersData();
  }, [search, roleFilter]);

  const handleToggleStatus = async (user: UserRecord) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      });

      if (!res.ok) {
        addToast('error', 'Update Failed', 'Could not update user account status.');
      } else {
        addToast('success', 'Status Updated', `User ${user.name} is now ${newStatus}.`);
        fetchUsersData();
      }
    } catch {
      addToast('error', 'Network Failure', 'Failed to reach server.');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      addToast('error', 'Validation Error', 'Please complete all required user details.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast('error', 'Account Creation Failed', data.error || 'Failed to create user account.');
      } else {
        addToast('success', 'Account Created!', `User ${formData.name} added to database.`);
        setShowAddModal(false);
        setFormData({
          name: '',
          username: '',
          email: '',
          studentId: '',
          program: 'Computer Science',
          role: 'STUDENT',
          password: '',
        });
        fetchUsersData();
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to add user account.');
    }
  };

  const handleApproveReset = async (id: number, approve: boolean) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approve }),
      });

      if (!res.ok) {
        addToast('error', 'Action Failed', 'Could not process password reset request.');
      } else {
        addToast(
          approve ? 'success' : 'info',
          approve ? 'Request Approved' : 'Request Rejected',
          `Password reset request ${approve ? 'approved' : 'rejected'}.`
        );
        fetchUsersData();
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to update request.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header user={currentUser} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-all shadow-sm flex items-center space-x-2 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#111827] flex items-center space-x-2">
                <Users className="w-7 h-7 text-[#10312B]" />
                <span>User Account Management ({users.length} Total)</span>
              </h1>
              <p className="text-xs text-gray-500">Manage student & admin credentials, status, and reset approvals</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 bg-[#10312B] hover:bg-[#1b5349] text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Account</span>
          </button>
        </div>

        {/* Navigation Tabs (Users vs Password Reset Queue) */}
        <div className="flex items-center space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'users'
                ? 'border-[#10312B] text-[#10312B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All User Accounts ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resets')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 relative ${
              activeTab === 'resets'
                ? 'border-[#10312B] text-[#10312B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Password Reset Queue ({resetRequests.length})</span>
            {resetRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Tab 1: All User Accounts Table */}
        {activeTab === 'users' && (
          <>
            {/* Search & Role Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, username, email, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10312B]"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Shield className="w-4 h-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#10312B]"
                >
                  <option value="All">All Roles</option>
                  <option value="ADMIN">Admins Only</option>
                  <option value="STUDENT">Students Only</option>
                </select>
              </div>
            </div>

            {/* Users Roster Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="py-20 text-center text-gray-400 font-bold">Loading user database...</div>
              ) : users.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Users Found"
                  description="No user accounts matched your search criteria."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Name & Handle</th>
                        <th className="py-4 px-6">Email / Student ID</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6">Program</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">{user.name}</div>
                            <div className="text-[11px] font-mono text-gray-500">@{user.username}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-gray-700 text-xs font-semibold">{user.email}</div>
                            <div className="text-[11px] font-mono text-gray-400">{user.studentId || 'N/A'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded font-mono ${
                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-600 font-semibold">{user.program || 'N/A'}</td>
                          <td className="py-4 px-6">
                            <StatusBadge status={user.status} />
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                                user.status === 'Active'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {user.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Password Reset Requests Queue */}
        {activeTab === 'resets' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {resetRequests.length === 0 ? (
              <EmptyState
                icon={KeyRound}
                title="No Pending Reset Requests"
                description="There are currently no password reset requests waiting for admin approval."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Account Email</th>
                      <th className="py-4 px-6">Username</th>
                      <th className="py-4 px-6">Requested At</th>
                      <th className="py-4 px-6 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {resetRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-900">{req.email || req.username}</td>
                        <td className="py-4 px-6 font-mono text-xs text-gray-600">@{req.username}</td>
                        <td className="py-4 px-6 font-mono text-xs text-gray-500">
                          {new Date(req.requestedAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApproveReset(req.id, true)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveReset(req.id, false)}
                              className="px-3.5 py-1.5 bg-gray-100 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#10312B]">Add New Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Juan Cruz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="e.g. juan.cruz"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="juan.cruz@dlsau.edu.ph"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Student ID / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. STU-1049"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Initial account password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#10312B] hover:bg-[#1b5349] text-white text-xs font-bold rounded-xl shadow"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
