import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export interface UserSession {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  studentId?: string | null;
}

const COOKIE_NAME = 'alis_session';

export async function setSession(user: UserSession) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify(user);
  cookieStore.set(COOKIE_NAME, Buffer.from(sessionData).toString('base64'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;
    const json = Buffer.from(cookie.value, 'base64').toString('utf-8');
    return JSON.parse(json) as UserSession;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
