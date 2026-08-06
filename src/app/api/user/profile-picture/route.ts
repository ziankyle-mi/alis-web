import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profilePicture } = await request.json();

    await prisma.user.update({
      where: { id: session.id },
      data: { profilePicture: profilePicture || null },
    });

    return NextResponse.json({ success: true, profilePicture });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile picture.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { profilePicture: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove profile picture.' }, { status: 500 });
  }
}
