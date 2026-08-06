import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || String(session.role).toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalBooks = await prisma.book.count();
    const totalTransactions = await prisma.borrowRecord.count();
    const totalUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
    const activeLoans = await prisma.borrowRecord.count({ where: { status: 'borrowed' } });

    // 1. Top 10 Popular Books
    const topBooksRaw = await prisma.borrowRecord.groupBy({
      by: ['bookTitle'],
      _count: { bookTitle: true },
      orderBy: { _count: { bookTitle: 'desc' } },
      take: 10,
    });

    const popularBooksData = topBooksRaw.map((item) => ({
      title: item.bookTitle.length > 25 ? item.bookTitle.slice(0, 25) + '...' : item.bookTitle,
      borrows: item._count.bookTitle,
    }));

    // 2. Category Breakdown
    const books = await prisma.book.findMany({ select: { category: true } });
    const categoryCounts: Record<string, number> = {};
    books.forEach((b) => {
      const cat = b.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    // 3. Top Borrowers (Matching legacy analytics.py get_top_borrowers)
    const topBorrowersRaw = await prisma.borrowRecord.groupBy({
      by: ['studentName', 'studentId'],
      _count: { studentId: true },
      orderBy: { _count: { studentId: 'desc' } },
      take: 10,
    });

    const topBorrowersData = topBorrowersRaw.map((b) => ({
      name: b.studentName || b.studentId || 'Unknown Student',
      borrows: b._count.studentId,
    }));

    // 4. Status Breakdown
    const borrowed = await prisma.borrowRecord.count({ where: { status: 'borrowed' } });
    const returned = await prisma.borrowRecord.count({ where: { status: 'returned' } });
    const damaged = await prisma.borrowRecord.count({ where: { status: 'damaged' } });
    const lost = await prisma.borrowRecord.count({ where: { status: 'lost' } });

    const statusData = [
      { name: 'Active Borrowed', value: borrowed },
      { name: 'Returned', value: returned },
      { name: 'Damaged', value: damaged },
      { name: 'Lost', value: lost },
    ].filter((s) => s.value > 0);

    // Top Genre
    const topGenre = categoryData.sort((a, b) => b.value - a.value)[0]?.name || 'Technology';

    return NextResponse.json({
      metrics: {
        totalBooks,
        totalTransactions,
        totalUsers,
        activeLoans,
        topGenre,
      },
      popularBooksData,
      categoryData,
      topBorrowersData,
      statusData,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics.' }, { status: 500 });
  }
}
