import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const books = await db.book.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { bookCode: { contains: search } },
                  { bookTitle: { contains: search } },
                  { authorName: { contains: search } },
                ],
              }
            : {},
          category && category !== 'All' ? { category: { equals: category } } : {},
        ],
      },
      orderBy: { bookTitle: 'asc' },
    });

    return NextResponse.json({ books });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { bookCode, authorName, bookTitle, category, publicationYear, totalCopies } = body;

    if (!bookCode || !bookTitle || !authorName) {
      return NextResponse.json({ error: 'Book Code, Title, and Author are required.' }, { status: 400 });
    }

    const copies = parseInt(totalCopies) || 1;

    const book = await db.book.create({
      data: {
        bookCode: bookCode.trim(),
        bookTitle: bookTitle.trim(),
        authorName: authorName.trim(),
        category: category?.trim() || 'General',
        publicationYear: publicationYear?.trim() || '',
        totalCopies: copies,
        availableCopies: copies,
        isBorrowed: false,
      },
    });

    return NextResponse.json({ success: true, book });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, bookCode, authorName, bookTitle, category, publicationYear, totalCopies, availableCopies } = body;

    const updated = await db.book.update({
      where: { id: parseInt(id) },
      data: {
        bookCode: bookCode.trim(),
        bookTitle: bookTitle.trim(),
        authorName: authorName.trim(),
        category: category?.trim() || 'General',
        publicationYear: publicationYear?.trim() || '',
        totalCopies: parseInt(totalCopies) || 1,
        availableCopies: parseInt(availableCopies) !== undefined ? parseInt(availableCopies) : parseInt(totalCopies) || 1,
      },
    });

    return NextResponse.json({ success: true, book: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Book ID required' }, { status: 400 });

    await db.book.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
