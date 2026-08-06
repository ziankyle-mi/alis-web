import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-passwords';

export async function POST(request: Request) {
  try {
    const { identifier, newPassword } = await request.json();

    if (!identifier || !newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: 'Invalid input. Password must be at least 4 characters.' }, { status: 400 });
    }

    const cleanIdent = String(identifier).trim().toLowerCase();
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdent } },
          { email: { equals: cleanIdent } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
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
    return NextResponse.json({ error: err.message || 'Failed to update password.' }, { status: 500 });
  }
}
