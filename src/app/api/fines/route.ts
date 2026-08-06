import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { calculateFine } from '@/lib/fine-calculator';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const emailFilter = session.role === 'STUDENT' ? session.email : searchParams.get('email');

    const records = await db.borrowRecord.findMany({
      where: {
        AND: [
          emailFilter ? { studentEmail: emailFilter } : {},
          search
            ? {
                OR: [
                  { studentId: { contains: search } },
                  { studentName: { contains: search } },
                  { bookTitle: { contains: search } },
                ],
              }
            : {},
        ],
      },
      orderBy: { returnDate: 'asc' },
    });

    const fineRecords = records
      .map((r) => {
        const fineInfo = calculateFine(
          r.returnDate,
          r.actualReturnDate,
          r.customFine,
          r.finePaid,
          r.status
        );
        return {
          ...r,
          ...fineInfo,
        };
      })
      .filter((r) => r.finePaid || r.totalFine > 0);

    return NextResponse.json({ fines: fineRecords });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { recordId, action } = await request.json();

    if (!recordId) return NextResponse.json({ error: 'recordId required' }, { status: 400 });

    const record = await db.borrowRecord.findUnique({ where: { id: parseInt(recordId) } });
    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    if (action === 'mark_paid') {
      // Mark fine as paid & return book
      await db.borrowRecord.update({
        where: { id: record.id },
        data: {
          finePaid: true,
          paymentStatus: 'paid',
          status: 'returned',
          actualReturnDate: new Date(),
        },
      });

      // Restore available copies
      await db.book.updateMany({
        where: { bookCode: record.bookCode },
        data: { availableCopies: { increment: 1 } },
      });

      return NextResponse.json({ success: true, message: 'Fine marked as paid and book returned!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { recordId } = await request.json();

    await db.borrowRecord.update({
      where: { id: parseInt(recordId) },
      data: {
        paymentStatus: 'pending',
        paymentRequestedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Payment confirmation request submitted to librarian!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
