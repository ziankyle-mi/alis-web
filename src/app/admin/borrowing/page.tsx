'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { QrCode, Search, CheckCircle, AlertTriangle, ArrowLeft, Layers, RefreshCw, XCircle } from 'lucide-react';

interface BorrowRecord {
  id: number;
  bookCode: string;
  bookTitle: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  borrowDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  status: string;
}

export default function StudentBorrowingPage() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // QR Claim Input State
  const [qrInput, setQrInput] = useState('');

  // Penalty Modal State
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [penaltyType, setPenaltyType] = useState<'damaged' | 'lost'>('damaged');
  const [customFine, setCustomFine] = useState(150);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status: statusFilter });
      const res = await fetch(`/api/borrows?${query}`);
      const data = await res.json();
      if (data.records) setRecords(data.records);
    } catch {
      addToast('error', 'Fetch Failure', 'Could not load borrowing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
    fetchRecords();
  }, [search, statusFilter]);

  // Handle QR Scan / Claim Submission (Ported from legacy qr_borrow.py)
  const handleVerifyQRClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) {
      addToast('error', 'Input Required', 'Please scan or type a transaction reference ID.');
      return;
    }

    try {
      const res = await fetch('/api/borrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim_qr', transactionId: qrInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast('error', 'QR Claim Verification Failed', data.error || 'Invalid or expired transaction.');
      } else {
        addToast('success', 'Book Claim Verified!', `'${data.bookTitle}' checked out to student.`);
        setQrInput('');
        fetchRecords();
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to process QR verification.');
    }
  };

  const handleMarkReturned = async (id: number) => {
    try {
      const res = await fetch('/api/borrows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'mark_returned' }),
      });

      if (!res.ok) {
        addToast('error', 'Update Error', 'Could not mark record as returned.');
      } else {
        addToast('success', 'Book Returned', 'Book copy incremented back to inventory.');
        fetchRecords();
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to update record status.');
    }
  };

  const handleApplyPenalty = async () => {
    if (!selectedRecord) return;

    try {
      const res = await fetch('/api/borrows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRecord.id,
          action: 'apply_penalty',
          penaltyType,
          customFine,
        }),
      });

      if (!res.ok) {
        addToast('error', 'Penalty Failed', 'Could not process penalty fee.');
      } else {
        addToast(
          'warning',
          'Penalty Applied',
          `₱${customFine} fine recorded for student ${selectedRecord.studentId || selectedRecord.studentEmail}.`
        );
        setSelectedRecord(null);
        fetchRecords();
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to process penalty.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header user={user} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Top Control Bar */}
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
                <QrCode className="w-7 h-7 text-[#10312B]" />
                <span>Student Borrowing Management ({records.length})</span>
              </h1>
              <p className="text-xs text-gray-500">Scan digital QR passes, track active loans, process returns & penalties</p>
            </div>
          </div>
        </div>

        {/* QR Code Counter Verification Bar (Legacy qr_borrow.py Admin Claim Feature) */}
        <div className="bg-gradient-to-r from-[#10312B] to-[#1b5349] text-white rounded-3xl p-6 shadow-xl mb-8 border border-emerald-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <QrCode className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">Scan Student QR Borrow Pass</h3>
              <p className="text-xs text-emerald-100 max-w-md">
                Enter or scan the transaction reference ID shown on the student's digital pass to verify book checkout.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyQRClaim} className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="e.g. TX-1770281-BK-3801"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-xs font-mono text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs rounded-xl shadow-lg transition-all shrink-0"
            >
              Verify & Claim
            </button>
          </form>
        </div>

        {/* Filter Tabs & Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {['All', 'Borrowed', 'Overdue', 'Returned', 'Return Requested'].map((tab) => (
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
              placeholder="Search student ID, name, book..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10312B]"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-gray-400 font-bold">Loading borrowing transactions...</div>
          ) : records.length === 0 ? (
            <EmptyState
              icon={QrCode}
              title="No Borrowing Records"
              description="No active loans or transactions match the selected filter."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Book Title</th>
                    <th className="py-4 px-6">Student ID & Name</th>
                    <th className="py-4 px-6">Borrow Date</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{rec.bookTitle}</div>
                        <div className="text-[11px] font-mono text-gray-500">{rec.bookCode}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-800">{rec.studentName || 'Student'}</div>
                        <div className="text-[11px] font-mono text-gray-500">{rec.studentId || rec.studentEmail}</div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600 font-mono">
                        {new Date(rec.borrowDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600 font-mono">
                        {new Date(rec.returnDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {(rec.status === 'borrowed' || rec.status === 'return_requested' || rec.status === 'overdue') && (
                            <button
                              onClick={() => handleMarkReturned(rec.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Mark Returned</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-bold rounded-xl transition-all border border-gray-200"
                          >
                            Penalty
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
      </main>

      {/* Damaged / Lost Penalty Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Process Damaged / Lost Penalty</h3>
            <p className="text-xs text-gray-500 mb-4">Record fine & adjust status for {selectedRecord.bookTitle}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Penalty Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPenaltyType('damaged');
                      setCustomFine(150);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      penaltyType === 'damaged'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Damaged Book (₱150)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPenaltyType('lost');
                      setCustomFine(300);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      penaltyType === 'lost'
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Lost Book (₱300)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fine Amount (₱)</label>
                <input
                  type="number"
                  value={customFine}
                  onChange={(e) => setCustomFine(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPenalty}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Apply Penalty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
