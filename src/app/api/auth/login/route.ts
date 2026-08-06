import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth-passwords';
import { setSession } from '@/lib/session';

// Memory store for failed login attempts lockout (5 attempts -> 30s)
const lockoutStore = new Map<string, { attempts: number; lockedUntil?: number }>();

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/Email and Password are required.' }, { status: 400 });
    }

    const cleanIdent = String(identifier).trim().toLowerCase();
    const now = Date.now();
    const lockout = lockoutStore.get(cleanIdent);

    if (lockout?.lockedUntil && lockout.lockedUntil > now) {
      const remainingSeconds = Math.ceil((lockout.lockedUntil - now) / 1000);
      return NextResponse.json(
        { error: `Too many failed attempts. Account locked out for ${remainingSeconds}s.` },
        { status: 429 }
      );
    }

    // Find user by username or email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdent } },
          { email: { equals: cleanIdent } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    if (user.status === 'Suspended') {
      return NextResponse.json({ error: 'Your account has been suspended. Please contact the librarian.' }, { status: 403 });
    }

    const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);

    if (!isValid) {
      const attempts = (lockout?.attempts || 0) + 1;
      if (attempts >= 5) {
        lockoutStore.set(cleanIdent, { attempts: 0, lockedUntil: now + 30000 });
        return NextResponse.json(
          { error: 'Too many failed attempts. Locked out for 30 seconds.' },
          { status: 429 }
        );
      } else {
        lockoutStore.set(cleanIdent, { attempts });
      }
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // Successful login - clear lockout
    lockoutStore.delete(cleanIdent);

    const sessionUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      studentId: user.studentId,
    };

    await setSession(sessionUser);

    return NextResponse.json({
      success: true,
      user: sessionUser,
      redirectUrl: user.role === 'ADMIN' ? '/admin' : '/student',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
