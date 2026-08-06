import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { transactionId, bookId, bookTitle, returnDate } = await request.json();

    const tx = await db.borrowTransaction.create({
      data: {
        id: transactionId,
        userId: session.studentId || session.email,
        userName: session.name,
        userEmail: session.email,
        bookId,
        bookTitle,
        borrowDate: new Date(),
        dueDate: new Date(returnDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
