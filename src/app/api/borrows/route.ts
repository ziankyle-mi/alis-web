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
    const statusFilter = searchParams.get('status') || 'All';
    const emailFilter = session.role === 'STUDENT' ? session.email : searchParams.get('email');

    // Fetch borrow records
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
                  { bookCode: { contains: search } },
                ],
              }
            : {},
          statusFilter !== 'All' ? { status: statusFilter } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich records with calculated fines
    const enrichedRecords = records.map((r) => {
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
    });

    // Fetch in-flight QR transactions if Admin or for student
    const pendingTransactions = await db.borrowTransaction.findMany({
      where: {
        AND: [
          emailFilter ? { userEmail: emailFilter } : {},
          { status: { in: ['pending', 'PENDING_ADMIN_CLAIM'] } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      records: enrichedRecords,
      pendingTransactions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { recordId, action, customFine, suspendStudent } = body;

    if (!recordId || !action) {
      return NextResponse.json({ error: 'recordId and action are required' }, { status: 400 });
    }

    const record = await db.borrowRecord.findUnique({ where: { id: parseInt(recordId) } });
    if (!record) return NextResponse.json({ error: 'Borrow record not found' }, { status: 404 });

    if (action === 'return' || action === 'approve_return') {
      // Mark as returned & restore available copies
      await db.borrowRecord.update({
        where: { id: record.id },
        data: {
          status: 'returned',
          actualReturnDate: new Date(),
        },
      });

      // Increment available copies
      await db.book.updateMany({
        where: { bookCode: record.bookCode },
        data: { availableCopies: { increment: 1 } },
      });

      return NextResponse.json({ success: true, message: 'Book marked as returned successfully!' });
    }

    if (action === 'request_return') {
      // Student requests return
      await db.borrowRecord.update({
        where: { id: record.id },
        data: { status: 'return_requested' },
      });
      return NextResponse.json({ success: true, message: 'Return request submitted to librarian!' });
    }

    if (action === 'damaged' || action === 'lost') {
      if (session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required for penalties.' }, { status: 403 });
      }

      const fineAmount = parseInt(customFine) || 0;

      // Update record status & add custom fine penalty
      await db.borrowRecord.update({
        where: { id: record.id },
        data: {
          status: action,
          customFine: fineAmount,
        },
      });

      // Decrement total copies if lost/damaged
      await db.book.updateMany({
        where: { bookCode: record.bookCode },
        data: { totalCopies: { decrement: 1 } },
      });

      // Optionally suspend student account if requested
      if (suspendStudent && record.studentId) {
        await db.user.updateMany({
          where: { studentId: record.studentId },
          data: { status: 'Suspended' },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Book status updated to ${action} with ₱${fineAmount} fine applied.`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
