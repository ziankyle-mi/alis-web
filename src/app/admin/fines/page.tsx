'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { DollarSign, Search, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';

interface FineRecord {
  id: number;
  bookCode: string;
  bookTitle: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  returnDate: string;
  daysOverdue: number;
  fineAmount: number;
  finePaid: boolean;
  paymentStatus: string;
}

export default function FineManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchFines = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status: statusFilter });
      const res = await fetch(`/api/fines?${query}`);
      const data = await res.json();
      if (data.fines) setFines(data.fines);
    } catch {
      addToast('error', 'Fetch Failure', 'Failed to load fine records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
    fetchFines();
  }, [search, statusFilter]);

  const handleMarkPaid = async (id: number) => {
    try {
      const res = await fetch('/api/fines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'mark_paid' }),
      });

      if (!res.ok) {
        addToast('error', 'Update Error', 'Could not record fine payment.');
      } else {
        addToast('success', 'Payment Settled', 'Fine record marked as Paid.');
        fetchFines();
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to settle fine.');
    }
  };

  // Calculate total outstanding balance
  const totalOutstanding = fines.reduce((sum, item) => (item.finePaid ? sum : sum + item.fineAmount), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header user={user} />
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
                <DollarSign className="w-7 h-7 text-[#10312B]" />
                <span>Fine Management ({fines.length} Records)</span>
              </h1>
              <p className="text-xs text-gray-500">Track overdue penalty fees (Policy: ₱5/day overdue) and payment claims</p>
            </div>
          </div>
        </div>

        {/* Total Outstanding Fine Summary Card */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-3xl p-6 shadow-xl mb-8 border border-red-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-100">Total Unpaid Balance</p>
              <h2 className="text-3xl font-black font-mono">₱{totalOutstanding.toLocaleString()}</h2>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold font-mono">
            ₱5 / Overdue Day
          </span>
        </div>

        {/* Search & Status Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            {['All', 'Unpaid', 'Paid'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab
                    ? 'bg-[#10312B] text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or book title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10312B]"
            />
          </div>
        </div>

        {/* Fine Records Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-gray-400 font-bold">Loading fine records...</div>
          ) : fines.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No Fine Records"
              description="No overdue penalties match your current filter."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Student ID & Name</th>
                    <th className="py-4 px-6">Book Title</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6">Days Overdue</th>
                    <th className="py-4 px-6">Fine Amount</th>
                    <th className="py-4 px-6">Payment Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {fines.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{item.studentName || 'Student'}</div>
                        <div className="text-[11px] font-mono text-gray-500">{item.studentId || item.studentEmail}</div>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-800">{item.bookTitle}</td>
                      <td className="py-4 px-6 text-xs text-gray-600 font-mono">
                        {new Date(item.returnDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-bold text-red-600">
                        {item.daysOverdue > 0 ? `${item.daysOverdue} days` : '0 days'}
                      </td>
                      <td className="py-4 px-6 font-mono font-extrabold text-gray-900 text-base">
                        ₱{item.fineAmount}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={item.finePaid ? 'Paid' : item.paymentStatus === 'pending' ? 'Pending' : 'Unpaid'} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!item.finePaid && (
                          <button
                            onClick={() => handleMarkPaid(item.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1 ml-auto"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
