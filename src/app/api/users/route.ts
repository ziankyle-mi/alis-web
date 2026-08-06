import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/auth-passwords';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || 'All';
    const statusFilter = searchParams.get('status') || 'All';

    const users = await db.user.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { username: { contains: search } },
                  { email: { contains: search } },
                  { studentId: { contains: search } },
                ],
              }
            : {},
          roleFilter !== 'All' ? { role: roleFilter } : {},
          statusFilter !== 'All' ? { status: statusFilter } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        studentId: true,
        program: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, username, email, studentId, program, role, status, password } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'Name, Username, Email, and Password are required.' }, { status: 400 });
    }

    const existing = await db.user.findFirst({
      where: {
        OR: [{ username: username.trim() }, { email: email.trim() }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'A user with that Username or Email already exists.' }, { status: 400 });
    }

    const { salt, hash } = hashPassword(password);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        studentId: studentId?.trim() || null,
        program: program?.trim() || 'BSIT',
        role: role || 'STUDENT',
        status: status || 'Active',
        passwordHash: hash,
        passwordSalt: salt,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, username, email, studentId, program, role, status, password } = body;

    const updateData: any = {
      name: name?.trim(),
      username: username?.trim(),
      email: email?.trim(),
      studentId: studentId?.trim() || null,
      program: program?.trim(),
      role,
      status,
    };

    if (password && password.trim()) {
      const { salt, hash } = hashPassword(password);
      updateData.passwordHash = hash;
      updateData.passwordSalt = salt;
    }

    const updated = await db.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    await db.user.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
