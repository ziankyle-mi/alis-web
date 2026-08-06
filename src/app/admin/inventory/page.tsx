'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, ArrowLeft, BookOpen, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

interface Book {
  id: number;
  bookCode: string;
  bookTitle: string;
  authorName: string;
  category: string;
  publicationYear: string;
  totalCopies: number;
  availableCopies: number;
  isBorrowed: boolean;
}

export default function BookInventoryPage() {
  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Toasts & Dialogs State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    bookCode: '',
    bookTitle: '',
    authorName: '',
    category: 'General',
    publicationYear: '',
    totalCopies: 1,
  });

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, category: categoryFilter });
      const res = await fetch(`/api/books?${query}`);
      const data = await res.json();
      if (data.books) setBooks(data.books);
    } catch {
      addToast('error', 'Fetch Error', 'Failed to load library inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user));
    fetchBooks();
  }, [search, categoryFilter]);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormData({
      bookCode: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      bookTitle: '',
      authorName: '',
      category: 'General',
      publicationYear: new Date().getFullYear().toString(),
      totalCopies: 1,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      bookCode: book.bookCode,
      bookTitle: book.bookTitle,
      authorName: book.authorName,
      category: book.category || 'General',
      publicationYear: book.publicationYear || '',
      totalCopies: book.totalCopies || 1,
    });
    setShowModal(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bookTitle.trim() || !formData.authorName.trim()) {
      addToast('error', 'Validation Error', 'Book Title and Author Name are required.');
      return;
    }

    try {
      const url = '/api/books';
      const method = editingBook ? 'PUT' : 'POST';
      const body = editingBook ? { id: editingBook.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast('error', 'Save Failed', err.error || 'Could not save book record.');
        return;
      }

      addToast('success', 'Book Saved', `'${formData.bookTitle}' was successfully saved.`);
      setShowModal(false);
      fetchBooks();
    } catch {
      addToast('error', 'Network Failure', 'Failed to connect to server.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/books?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        addToast('error', 'Delete Failed', 'Could not delete book from inventory.');
      } else {
        addToast('success', 'Book Deleted', `'${deleteTarget.bookTitle}' removed from catalog.`);
        fetchBooks();
      }
    } catch {
      addToast('error', 'Network Failure', 'Failed to delete book.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(books.length / itemsPerPage) || 1;
  const paginatedBooks = books.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header user={user} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Book Record?"
        message={`Are you sure you want to delete '${deleteTarget?.bookTitle}' (${deleteTarget?.bookCode})? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

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
                <BookOpen className="w-7 h-7 text-[#10312B]" />
                <span>Books Inventory ({books.length} Total)</span>
              </h1>
              <p className="text-xs text-gray-500">Manage catalog titles, author info, and available physical copies</p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center space-x-2 bg-[#10312B] hover:bg-[#1b5349] text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Book</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by book code, title, or author..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#10312B]"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Layers className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#10312B]"
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Fiction">Fiction</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="py-20 text-center text-gray-400 font-bold">Loading inventory database...</div>
          ) : paginatedBooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Books Found"
              description="No book records matched your current search or category filter."
              actionText="Add Book"
              onAction={handleOpenAddModal}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Book Code</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Author</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Year</th>
                    <th className="py-4 px-6 text-center">Copies (Avail / Total)</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginatedBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-extrabold text-[#10312B]">{book.bookCode}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">{book.bookTitle}</td>
                      <td className="py-4 px-6 text-gray-600">{book.authorName}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-md">
                          {book.category || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-mono text-xs">{book.publicationYear || 'N/A'}</td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            book.availableCopies > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            className="p-2 text-gray-600 hover:text-[#10312B] hover:bg-gray-100 rounded-xl transition-all"
                            title="Edit Book"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(book)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Book"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs text-gray-500 font-medium">
              Showing page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({books.length} items)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Book Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#10312B]">
                {editingBook ? 'Edit Book Record' : 'Add New Book to Inventory'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Book Code</label>
                <input
                  type="text"
                  value={formData.bookCode}
                  onChange={(e) => setFormData({ ...formData, bookCode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Book Title</label>
                <input
                  type="text"
                  placeholder="e.g. Clean Code"
                  value={formData.bookTitle}
                  onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Author Name</label>
                <input
                  type="text"
                  placeholder="e.g. Robert C. Martin"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="General">General</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Publication Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2021"
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Total Copy Count</label>
                <input
                  type="number"
                  min={1}
                  value={formData.totalCopies}
                  onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#10312B] hover:bg-[#1b5349] text-white text-xs font-bold rounded-xl shadow"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
