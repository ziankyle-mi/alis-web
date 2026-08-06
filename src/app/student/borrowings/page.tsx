'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { BookOpen, ArrowLeft, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';

interface BorrowRecord {
  id: number;
  bookCode: string;
  bookTitle: string;
  borrowDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  status: string;
}

export default function StudentBorrowingsPage() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
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

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/borrows?myBorrows=true');
      const data = await res.json();
      if (data.records) setRecords(data.records);
    } catch {
      addToast('error', 'Fetch Failure', 'Failed to load borrowing history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
    fetchBorrowings();
  }, []);

  // Student Request Return Action (Ported from legacy student_borrowings.py)
  const handleRequestReturn = async (id: number) => {
    try {
      const res = await fetch('/api/borrows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'request_return' }),
      });

      if (!res.ok) {
        addToast('error', 'Request Failed', 'Could not request return for this book.');
      } else {
        addToast(
          'success',
          'Return Requested!',
          'Librarian notified. Present physical book at counter to complete return.'
        );
        fetchBorrowings();
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to submit return request.');
    }
  };

  const activeRecords = records.filter(
    (r) => r.status === 'borrowed' || r.status === 'return_requested' || r.status === 'overdue'
  );
  const historyRecords = records.filter((r) => r.status === 'returned');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header user={user} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/student"
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-all shadow-sm flex items-center space-x-2 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#111827] flex items-center space-x-2">
                <BookOpen className="w-7 h-7 text-[#10312B]" />
                <span>My Borrowings ({activeRecords.length} Active)</span>
              </h1>
              <p className="text-xs text-gray-500">View active loans, due dates, request returns, and view loan history</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'active'
                ? 'border-[#10312B] text-[#10312B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Active Loans ({activeRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'border-[#10312B] text-[#10312B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Borrowing History ({historyRecords.length})</span>
          </button>
        </div>

        {/* Active Loans Tab */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-bold">Loading active loans...</div>
            ) : activeRecords.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Active Loans"
                description="You currently have no books checked out from the library."
                actionText="Browse Book Catalog"
                onAction={() => (window.location.href = '/student/catalog')}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Book Title & Code</th>
                      <th className="py-4 px-6">Date Borrowed</th>
                      <th className="py-4 px-6">Expected Due Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Return Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {activeRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">{item.bookTitle}</div>
                          <div className="text-[11px] font-mono text-gray-500">{item.bookCode}</div>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-600 font-mono">
                          {new Date(item.borrowDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-600 font-mono">
                          {new Date(item.returnDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          {item.status === 'return_requested' ? (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pending Counter Return</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRequestReturn(item.id)}
                              className="px-4 py-2 bg-[#10312B] hover:bg-[#1b5349] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1 ml-auto"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Request Return</span>
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
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {historyRecords.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="No Returned History"
                description="Past returned book transactions will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Book Title</th>
                      <th className="py-4 px-6">Borrow Date</th>
                      <th className="py-4 px-6">Actual Return Date</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {historyRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-900">{item.bookTitle}</td>
                        <td className="py-4 px-6 text-xs text-gray-600 font-mono">
                          {new Date(item.borrowDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-600 font-mono">
                          {item.actualReturnDate ? new Date(item.actualReturnDate).toLocaleDateString() : 'Returned'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status="Returned" />
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
    </div>
  );
}
