'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { DollarSign, ArrowLeft, Printer, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';

interface FineItem {
  id: number;
  bookTitle: string;
  returnDate: string;
  daysOverdue: number;
  fineAmount: number;
  finePaid: boolean;
  paymentStatus: string;
}

export default function StudentFinesPage() {
  const [user, setUser] = useState<any>(null);
  const [fines, setFines] = useState<FineItem[]>([]);
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

  const fetchStudentFines = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fines?myFines=true');
      const data = await res.json();
      if (data.fines) setFines(data.fines);
    } catch {
      addToast('error', 'Fetch Error', 'Failed to load fine records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
    fetchStudentFines();
  }, []);

  const handleRequestPaymentVerification = async (id: number) => {
    try {
      const res = await fetch('/api/fines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'request_payment' }),
      });

      if (!res.ok) {
        addToast('error', 'Request Failed', 'Could not submit payment verification request.');
      } else {
        addToast(
          'success',
          'Verification Requested!',
          'Librarian notified. Please present payment at cashier to complete.'
        );
        fetchStudentFines();
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to request payment verification.');
    }
  };

  const handlePrintStatement = () => {
    addToast('info', 'Printing Fine Statement', 'Opening printable billing statement...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const totalOutstanding = fines.reduce((sum, item) => (item.finePaid ? sum : sum + item.fineAmount), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col print:bg-white print:p-0">
      <div className="print:hidden">
        <Header user={user} />
      </div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
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
                <DollarSign className="w-7 h-7 text-[#10312B]" />
                <span>My Fines & Billing Statements</span>
              </h1>
              <p className="text-xs text-gray-500">Track outstanding overdue fees, request cashier verifications, and download receipts</p>
            </div>
          </div>

          <button
            onClick={handlePrintStatement}
            className="px-4 py-2.5 bg-[#10312B] hover:bg-[#1b5349] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Fine Statement</span>
          </button>
        </div>

        {/* Printable Header Banner */}
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-extrabold text-[#10312B]">De La Salle Araneta University</h1>
          <h2 className="text-xl font-bold text-gray-700">Official Student Library Fine Billing Statement</h2>
          <p className="text-xs text-gray-500 mt-1">
            Student: {user?.name} ({user?.studentId || user?.email}) &bull; Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Total Outstanding Balance Gradient Card matching legacy create_gradient_bg */}
        <div className="bg-gradient-to-r from-[#10312B] via-[#1b5349] to-emerald-700 text-white rounded-3xl p-8 shadow-xl mb-8 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <CreditCard className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Total Outstanding Library Balance</p>
              <h2 className="text-4xl font-black font-mono">₱{totalOutstanding.toLocaleString()}</h2>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold font-mono">
              Policy: ₱5 / Day Overdue
            </span>
          </div>
        </div>

        {/* Fine Items Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-gray-400 font-bold">Loading fine balance records...</div>
          ) : fines.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No Outstanding Fines!"
              description="Your library account has no overdue fines or pending penalties."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Book Title</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6">Overdue Days</th>
                    <th className="py-4 px-6">Fine Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right print:hidden">Payment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {fines.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">{item.bookTitle}</td>
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
                      <td className="py-4 px-6 text-right print:hidden">
                        {!item.finePaid && item.paymentStatus !== 'pending' ? (
                          <button
                            onClick={() => handleRequestPaymentVerification(item.id)}
                            className="px-4 py-2 bg-[#10312B] hover:bg-[#1b5349] text-white text-xs font-bold rounded-xl shadow transition-all ml-auto"
                          >
                            Pay in Person / Request Verification
                          </button>
                        ) : item.paymentStatus === 'pending' ? (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 inline-block">
                            Verification Pending
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600">Settled</span>
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
