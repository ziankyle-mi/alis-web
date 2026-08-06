import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { verifyPassword, hashPassword } from '@/lib/auth-passwords';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: 'Invalid input. New password must be at least 4 characters.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isValid = verifyPassword(currentPassword, user.passwordSalt, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
    }

    const { salt, hash } = hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        passwordSalt: salt,
      },
    });

    return NextResponse.json({ success: true, message: 'Password successfully updated!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
