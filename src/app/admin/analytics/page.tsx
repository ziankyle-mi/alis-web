'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import Link from 'next/link';
import {
  BarChart3,
  BookOpen,
  Users,
  QrCode,
  ArrowLeft,
  RefreshCw,
  Printer,
  TrendingUp,
  PieChart as PieIcon,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface AnalyticsData {
  metrics: {
    totalBooks: number;
    totalTransactions: number;
    totalUsers: number;
    activeLoans: number;
    topGenre: string;
  };
  popularBooksData: { title: string; borrows: number }[];
  categoryData: { name: string; value: number }[];
  topBorrowersData: { name: string; borrows: number }[];
  statusData: { name: string; value: number }[];
}

const CATEGORY_COLORS = ['#10312B', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'categories' | 'borrowers' | 'statuses'>('books');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Unauthorized');
      const d = await res.json();
      setData(d);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      addToast('error', 'Fetch Error', 'Failed to load live analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
    fetchAnalytics();

    // Auto Refresh loop (10s) matching legacy analytics.py AUTO_REFRESH_MS
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePrintReport = () => {
    addToast('info', 'Preparing PDF Report', 'Opening browser print view for PDF export...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col print:bg-white print:p-0">
      <div className="print:hidden">
        <Header user={user} />
      </div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
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
                <BarChart3 className="w-7 h-7 text-[#10312B]" />
                <span>Analytics & Reports</span>
              </h1>
              <p className="text-xs text-gray-500">Live system statistics, circulation trends, and borrower metrics</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAnalytics}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-all shadow-sm flex items-center space-x-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="px-4 py-2.5 bg-[#10312B] hover:bg-[#1b5349] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* Printable Header Banner (Only visible during print) */}
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-extrabold text-[#10312B]">De La Salle Araneta University</h1>
          <h2 className="text-xl font-bold text-gray-700">ALIW Library Analytics & Circulation Report</h2>
          <p className="text-xs text-gray-500 mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Top 5 Headline Metric Cards */}
        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-gray-500 uppercase">Total Books</span>
                <BookOpen className="w-5 h-5 text-[#10312B]" />
              </div>
              <p className="text-3xl font-black text-[#10312B] font-mono">{data.metrics.totalBooks}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-gray-500 uppercase">Total Borrowed</span>
                <QrCode className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-600 font-mono">{data.metrics.totalTransactions}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-gray-500 uppercase">Registered Members</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-black text-blue-600 font-mono">{data.metrics.totalUsers}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-gray-500 uppercase">Active Loans</span>
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-amber-500 font-mono">{data.metrics.activeLoans}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-gray-500 uppercase">Top Genre</span>
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xl font-extrabold text-purple-600 truncate">{data.metrics.topGenre}</p>
            </div>
          </div>
        )}

        {/* Tab Selection Bar */}
        <div className="flex items-center space-x-2 border-b border-gray-200 mb-6 print:hidden">
          {[
            { id: 'books', label: 'Top Borrowed Books' },
            { id: 'categories', label: 'Category Distribution' },
            { id: 'borrowers', label: 'Top Student Borrowers' },
            { id: 'statuses', label: 'Loan Status Overview' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#10312B] text-[#10312B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart View Container */}
        {data && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm min-h-[420px] flex flex-col justify-between">
            {activeTab === 'books' && (
              <div>
                <h3 className="text-base font-extrabold text-[#10312B] mb-4">Top 10 Most Borrowed Books</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.popularBooksData} layout="vertical" margin={{ left: 40, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="title" type="category" width={180} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="borrows" fill="#10312B" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <h3 className="text-base font-extrabold text-[#10312B] mb-4">Book Catalog Category Breakdown</h3>
                <div className="h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={4}
                        label={({ name, percent }: any) => `${name || ''} (${(((percent || 0) * 100)).toFixed(0)}%)`}
                      >
                        {data.categoryData.map((_, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'borrowers' && (
              <div>
                <h3 className="text-base font-extrabold text-[#10312B] mb-4">Top 10 Student Borrowers</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topBorrowersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="borrows" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'statuses' && (
              <div>
                <h3 className="text-base font-extrabold text-[#10312B] mb-4">Borrowing Status Breakdown</h3>
                <div className="h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={4}
                        label={({ name, value }: any) => `${name}: ${value}`}
                      >
                        {data.statusData.map((_, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Auto-refreshing every 10s</span>
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
