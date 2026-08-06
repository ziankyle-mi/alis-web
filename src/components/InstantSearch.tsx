'use client';

import { useState, useEffect, useRef } from 'react';
import BookCoverImage from '@/components/BookCoverImage';
import { Search, BookOpen, X, Sparkles } from 'lucide-react';

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

interface InstantSearchProps {
  onSelectBook?: (book: Book) => void;
  placeholder?: string;
}

export default function InstantSearch({ onSelectBook, placeholder = 'Instant live search by title, author, code...' }: InstantSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/books?search=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.books) {
          setResults(data.books.slice(0, 6)); // Show top 6 instant matches
          setIsOpen(true);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }, 150); // Fast 150ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-gray-950/70 border border-gray-200 dark:border-emerald-900/40 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10312B] dark:focus:ring-emerald-500 transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Instant Search Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-up">
          <div className="p-2.5 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-extrabold text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Instant Matching Results</span>
            </span>
            <span>{results.length} found</span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-gray-400 font-medium">Searching catalog...</div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400 font-medium">No catalog books match "{query}"</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
              {results.map((book) => (
                <div
                  key={book.id}
                  onClick={() => {
                    if (onSelectBook) onSelectBook(book);
                    setIsOpen(false);
                  }}
                  className="p-3 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 flex items-center space-x-3 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                    <BookCoverImage
                      title={book.bookTitle}
                      author={book.authorName}
                      code={book.bookCode}
                      category={book.category}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                      {book.bookTitle}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{book.authorName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded font-bold">
                        {book.bookCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        }`}
                      >
                        {book.availableCopies} available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
