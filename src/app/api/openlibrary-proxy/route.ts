import { NextResponse } from 'next/server';

// Helper to generate a high-end SVG book cover data URL as a 100% reliable fallback
function generateSvgCover(title: string, author: string, category: string): string {
  const cleanTitle = title.trim();
  const cleanAuthor = author.trim() || 'DLSAU Library';
  const cleanCategory = category || 'General Collection';

  // Palette generator based on title hash
  const colors = [
    ['#10312B', '#1B5349'],
    ['#1E1B4B', '#3730A3'],
    ['#831843', '#BE185D'],
    ['#064E3B', '#047857'],
    ['#7C2D12', '#C2410C'],
    ['#1F2937', '#4B5563'],
  ];

  let hash = 0;
  for (let i = 0; i < cleanTitle.length; i++) hash += cleanTitle.charCodeAt(i);
  const [bg1, bg2] = colors[Math.abs(hash) % colors.length];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/>
        </filter>
      </defs>
      <rect width="300" height="450" fill="url(#grad)"/>
      <rect x="15" y="15" width="270" height="420" rx="12" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      
      <!-- Top Pill -->
      <rect x="25" y="30" width="120" height="24" rx="12" fill="rgba(255,255,255,0.15)"/>
      <text x="35" y="46" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" letter-spacing="1">${cleanCategory.toUpperCase().slice(0, 16)}</text>
      
      <!-- Center Title -->
      <foreignObject x="30" y="120" width="240" height="200">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: system-ui, sans-serif; text-align: center;">
          <div style="font-size: 22px; font-weight: 900; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${cleanTitle}</div>
          <div style="width: 40px; height: 3px; background: #10B981; margin: 16px auto; border-radius: 2px;"></div>
          <div style="font-size: 13px; font-weight: 600; opacity: 0.9;">${cleanAuthor}</div>
        </div>
      </foreignObject>
      
      <!-- Bottom Emblem -->
      <circle cx="150" cy="380" r="20" fill="rgba(255,255,255,0.1)"/>
      <text x="150" y="385" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">📖</text>
      <text x="150" y="415" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle">DLSAU LIBRARY</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get('title') || '';
  const rawAuthor = searchParams.get('author') || '';
  const category = searchParams.get('category') || 'General';

  if (!rawTitle) {
    return NextResponse.json({ coverUrl: generateSvgCover('DLSAU Book', 'Library', 'General') });
  }

  // 1. Sanitize title (remove subtitles after ':', '-', '(', '/')
  const primaryTitle = rawTitle.split(/[:\-\(\/]/)[0].trim();
  const cleanAuthor = rawAuthor.trim();

  // Search queries to attempt
  const queries = [
    primaryTitle,
    `${primaryTitle} ${cleanAuthor}`.trim(),
    rawTitle.trim(),
  ];

  // Try Open Library Search API
  for (const q of queries) {
    try {
      const openLibUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1`;
      const res = await fetch(openLibUrl, {
        headers: { 'User-Agent': 'DLSAU-Library-System/2.0' },
        next: { revalidate: 86400 },
      });
      const data = await res.json();

      if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
        const coverId = data.docs[0].cover_i;
        const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
        return NextResponse.json({ coverUrl, provider: 'openlibrary' });
      }
    } catch {
      // Continue next query
    }
  }

  // Try Google Books API Fallback
  try {
    const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(primaryTitle)}&maxResults=1`;
    const gRes = await fetch(googleUrl, { next: { revalidate: 86400 } });
    const gData = await gRes.json();

    if (gData.items && gData.items.length > 0) {
      const thumbnail = gData.items[0].volumeInfo?.imageLinks?.thumbnail;
      if (thumbnail) {
        const coverUrl = thumbnail.replace('http://', 'https://');
        return NextResponse.json({ coverUrl, provider: 'googlebooks' });
      }
    }
  } catch {
    // Fallback
  }

  // 100% Guaranteed High-Quality SVG Cover Artwork Fallback
  const fallbackCoverUrl = generateSvgCover(rawTitle, cleanAuthor, category);
  return NextResponse.json({ coverUrl: fallbackCoverUrl, provider: 'svg_fallback' });
}
