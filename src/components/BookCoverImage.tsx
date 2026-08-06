'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverImageProps {
  title: string;
  author: string;
  code: string;
  category?: string;
  className?: string;
}

export default function BookCoverImage({ title, author, code, category = 'General', className = '' }: BookCoverImageProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCover = async () => {
      try {
        const query = new URLSearchParams({ title, author, category });
        const res = await fetch(`/api/openlibrary-proxy?${query}`);
        const data = await res.json();
        if (isMounted && data.coverUrl) {
          setCoverUrl(data.coverUrl);
        }
      } catch {
        // Fallback handled by API
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCover();
    return () => {
      isMounted = false;
    };
  }, [title, author, category]);

  return (
    <div className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
      {loading ? (
        <div className="text-[10px] text-gray-400 font-bold animate-pulse">Loading Cover...</div>
      ) : coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="text-center p-3">
          <BookOpen className="w-8 h-8 text-[#10312B]/30 mx-auto mb-1" />
          <span className="text-[10px] font-mono text-gray-400 font-bold">{code}</span>
        </div>
      )}
    </div>
  );
}
