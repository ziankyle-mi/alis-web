'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BookCoverImage from '@/components/BookCoverImage';
import InstantSearch from '@/components/InstantSearch';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import Link from 'next/link';
import { Search, ArrowLeft, ShoppingCart, QrCode, Trash2, BookOpen, Layers, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Book {
  id: number;
  bookCode: string;
  bookTitle: string;
  authorName: string;
  category: string;
  publicationYear: string;
  availableCopies: number;
  totalCopies: number;
}

export default function StudentCatalogPage() {
  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Selected Book Detail Modal State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Cart & QR Modal States
  const [cart, setCart] = useState<Book[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [activeTransaction, setActiveTransaction] = useState<any | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
      addToast('error', 'Fetch Error', 'Failed to load catalog books.');
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

  const handleAddToCart = (book: Book) => {
    if (cart.find((item) => item.bookCode === book.bookCode)) {
      addToast('warning', 'Already in Cart', `'${book.bookTitle}' is already in your borrow cart.`);
      return;
    }
    if (cart.length >= 5) {
      addToast('error', 'Cart Limit Reached', 'Maximum 5 books allowed per checkout pass.');
      return;
    }
    if (book.availableCopies <= 0) {
      addToast('error', 'Copies Unavailable', `No physical copies of '${book.bookTitle}' available.`);
      return;
    }
    setCart([...cart, book]);
    addToast('success', 'Added to Cart', `'${book.bookTitle}' added to your borrow cart.`);
  };

  const handleRemoveFromCart = (code: string) => {
    setCart(cart.filter((b) => b.bookCode !== code));
  };

  const handleGenerateQR = async () => {
    if (cart.length === 0) return;
    try {
      const txId = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      for (const item of cart) {
        await fetch('/api/qr/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: `${txId}-${item.bookCode}`,
            bookId: item.bookCode,
            bookTitle: item.bookTitle,
            returnDate,
          }),
        });
      }

      setActiveTransaction({
        txId,
        items: cart,
        returnDate,
      });

      setCart([]);
      setShowCartDrawer(false);
      setShowQRModal(true);
      addToast('success', 'Digital Pass Generated', 'Present QR pass to librarian for checkout.');
    } catch {
      addToast('error', 'Generation Error', 'Failed to generate QR borrow pass.');
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(books.length / itemsPerPage) || 1;
  const paginatedBooks = books.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090d0c] text-gray-900 dark:text-gray-100 flex flex-col transition-colors">
      <Header user={user} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Sleek Header Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/student"
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-emerald-900/40 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all shadow-sm flex items-center space-x-2 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
                <BookOpen className="w-7 h-7 text-[#10312B] dark:text-emerald-400" />
                <span>DLSAU Library Catalog ({books.length} Books)</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live API cover artwork & instant auto-suggest search</p>
            </div>
          </div>

          <button
            onClick={() => setShowCartDrawer(true)}
            className="relative flex items-center justify-center space-x-2 bg-[#10312B] dark:bg-emerald-600 hover:bg-[#1b5349] dark:hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl text-xs font-extrabold shadow-xl transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-300 dark:text-emerald-950" />
            <span>Borrow Cart ({cart.length})</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Instant Live Search Auto-Suggest Bar & Category Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-emerald-900/40 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-96">
            <InstantSearch onSelectBook={(book) => setSelectedBook(book)} />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Layers className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-emerald-900/40 rounded-xl text-xs text-gray-800 dark:text-gray-200 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#10312B]"
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

        {/* Sleek Book Cards Grid with Card Flow & Ambient Glow */}
        {loading ? (
          <div className="py-24 text-center text-gray-400 font-bold">Loading 507 catalog books...</div>
        ) : paginatedBooks.length === 0 ? (
          <div className="py-24 text-center text-gray-400 font-bold">No books matched your search.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 mb-8">
            {paginatedBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="bg-white dark:bg-gray-900 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col justify-between card-glow cursor-pointer group"
              >
                <div>
                  {/* Live API Cover Thumbnail */}
                  <div className="w-full h-44 rounded-xl overflow-hidden mb-3 border border-gray-100 dark:border-gray-800 relative">
                    <BookCoverImage
                      title={book.bookTitle}
                      author={book.authorName}
                      code={book.bookCode}
                      category={book.category}
                      className="w-full h-full"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono rounded">
                      {book.bookCode}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-gray-900 dark:text-white text-xs line-clamp-2 mb-1 group-hover:text-emerald-500 transition-colors">
                    {book.bookTitle}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{book.authorName}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      book.availableCopies > 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {book.availableCopies} avail
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(book);
                    }}
                    disabled={book.availableCopies <= 0}
                    className="p-1.5 bg-[#10312B] dark:bg-emerald-600 hover:bg-[#1b5349] dark:hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-40"
                    title="Add to Cart"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sleek Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl border border-gray-200 dark:border-emerald-900/40 shadow-sm">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Showing page <strong className="text-gray-900 dark:text-white">{currentPage}</strong> of <strong className="text-gray-900 dark:text-white">{totalPages}</strong> ({books.length} items)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Book Click Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 dark:border-emerald-900/40 animate-scale-up">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6">
              <div className="w-36 h-52 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 shrink-0">
                <BookCoverImage
                  title={selectedBook.bookTitle}
                  author={selectedBook.authorName}
                  code={selectedBook.bookCode}
                  category={selectedBook.category}
                  className="w-full h-full"
                />
              </div>

              <div className="flex-1 text-left">
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold font-mono">
                  {selectedBook.bookCode}
                </span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-2 mb-1">{selectedBook.bookTitle}</h2>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">{selectedBook.authorName}</p>

                <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-gray-400">Category: </span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedBook.category || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Publication Year: </span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedBook.publicationYear || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Available Copies: </span>
                    <span className={`font-bold ${selectedBook.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {selectedBook.availableCopies} available out of {selectedBook.totalCopies}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddToCart(selectedBook);
                  setSelectedBook(null);
                }}
                disabled={selectedBook.availableCopies <= 0}
                className="px-6 py-2.5 bg-[#10312B] dark:bg-emerald-600 hover:bg-[#1b5349] text-white text-xs font-extrabold rounded-xl shadow-lg disabled:opacity-40"
              >
                + Add Book to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl animate-slide-in border-l border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
                <h2 className="text-lg font-bold text-[#10312B] dark:text-white flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-[#10312B] dark:text-emerald-400" />
                  <span>Borrow Cart ({cart.length}/5)</span>
                </h2>
                <button onClick={() => setShowCartDrawer(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold">
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs">Your cart is empty. Click "+ Add" on any book to begin.</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.bookCode} className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-xs">{item.bookTitle}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.authorName} &bull; {item.bookCode}</div>
                      </div>
                      <button onClick={() => handleRemoveFromCart(item.bookCode)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <button
                  onClick={handleGenerateQR}
                  className="w-full py-3.5 bg-[#10312B] dark:bg-emerald-600 hover:bg-[#1b5349] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-4 h-4 text-emerald-300" />
                  <span>Generate Borrow QR Pass</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Digital QR Pass Modal */}
      {showQRModal && activeTransaction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100 dark:border-emerald-900/40 animate-scale-up">
            <h2 className="text-xl font-bold text-[#10312B] dark:text-white mb-1">Digital Borrow QR Pass</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Present this QR code to the librarian counter to scan & claim your books</p>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 inline-block mb-6 shadow-inner">
              <QRCodeSVG
                value={JSON.stringify({
                  txId: activeTransaction.txId,
                  studentId: user?.studentId || user?.email,
                  books: activeTransaction.items.map((b: Book) => b.bookCode),
                  returnDate: activeTransaction.returnDate,
                })}
                size={200}
                level="H"
              />
            </div>

            <div className="text-xs font-mono text-gray-600 dark:text-gray-300 mb-6 bg-gray-100 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
              Tx Ref: {activeTransaction.txId} &bull; Due: {activeTransaction.returnDate}
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-3 bg-[#10312B] dark:bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-[#1b5349]"
            >
              Done & Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
