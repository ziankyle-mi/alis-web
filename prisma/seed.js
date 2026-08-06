const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const LEGACY_DB_DIR = path.join(__dirname, '../../../dlsaulibrarysystem-main/dlsaulibrarysystem-main/database');
const LOGIN_DB = path.join(LEGACY_DB_DIR, 'login_system.db');
const USERS_DB = path.join(LEGACY_DB_DIR, 'regularlogindatabase.db');
const BOOKS_DB = path.join(LEGACY_DB_DIR, 'books_system.db');

async function seed() {
  console.log('🌱 Starting legacy database migration...');

  // 1. Migrate Users from login_system.db & regularlogindatabase.db
  if (fs.existsSync(LOGIN_DB)) {
    console.log('Importing users from login_system.db...');
    const loginDb = new Database(LOGIN_DB, { readonly: true });
    
    // Admins
    try {
      const admins = loginDb.prepare('SELECT * FROM admins').all();
      for (const admin of admins) {
        await prisma.user.upsert({
          where: { email: admin.email || `${admin.username}@dlsau.edu.ph` },
          update: {},
          create: {
            name: admin.username || 'Admin User',
            username: admin.username,
            email: admin.email || `${admin.username}@dlsau.edu.ph`,
            role: 'ADMIN',
            status: admin.status || 'Active',
            passwordHash: admin.password || '',
            passwordSalt: admin.salt || '',
          },
        });
      }
    } catch (e) {
      console.log('Admins import note:', e.message);
    }

    // Regulars (Students)
    try {
      const regulars = loginDb.prepare('SELECT * FROM regulars').all();
      for (const reg of regulars) {
        const email = reg.email || `${reg.username}@student.dlsau.edu.ph`;
        const fullName = `${reg['first name'] || ''} ${reg['last name'] || ''}`.trim() || reg.username;
        await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            name: fullName,
            username: reg.username || email.split('@')[0],
            email,
            studentId: reg['student_id'] || reg['student id'] || reg['id_number'] || null,
            program: reg.major || reg.course || 'BSIT',
            role: 'STUDENT',
            status: reg.status || 'Active',
            passwordHash: reg.password || '',
            passwordSalt: reg.salt || '',
            profilePicture: reg.profile_picture || null,
          },
        });
      }
    } catch (e) {
      console.log('Regulars import note:', e.message);
    }
  }

  // 2. Migrate Books from books_system.db
  if (fs.existsSync(BOOKS_DB)) {
    console.log('Importing books & borrow records from books_system.db...');
    const booksDb = new Database(BOOKS_DB, { readonly: true });

    try {
      const books = booksDb.prepare('SELECT * FROM books').all();
      for (const b of books) {
        await prisma.book.upsert({
          where: { bookCode: b.book_code },
          update: {},
          create: {
            bookCode: b.book_code,
            authorName: b.author_name || 'Unknown Author',
            bookTitle: b.book_title || 'Untitled Book',
            category: b.category || 'General',
            publicationYear: String(b.publication_year || ''),
            isBorrowed: Boolean(b.is_borrowed),
            totalCopies: b.total_copies || 1,
            availableCopies: b.available_copies !== undefined ? b.available_copies : 1,
          },
        });
      }
    } catch (e) {
      console.log('Books import note:', e.message);
    }

    try {
      const records = booksDb.prepare('SELECT * FROM borrow_records').all();
      for (const r of records) {
        await prisma.borrowRecord.create({
          data: {
            bookCode: r.book_code,
            bookTitle: r.book_title,
            studentName: r.student_name,
            studentId: r.student_id,
            studentEmail: r.student_email,
            borrowDate: new Date(r.borrow_date || Date.now()),
            returnDate: new Date(r.return_date || Date.now()),
            actualReturnDate: r.actual_return_date ? new Date(r.actual_return_date) : null,
            status: r.status || 'borrowed',
            finePaid: Boolean(r.fine_paid),
            customFine: r.custom_fine || 0,
            paymentStatus: r.payment_status || 'unrequested',
            paymentRequestedAt: r.payment_requested_at ? new Date(r.payment_requested_at) : null,
          },
        });
      }
    } catch (e) {
      console.log('Borrow records import note:', e.message);
    }
  }

  // Ensure default demo admin exists if DB was empty
  await prisma.user.upsert({
    where: { email: 'admin@dlsau.edu.ph' },
    update: {},
    create: {
      name: 'System Administrator',
      username: 'admin',
      email: 'admin@dlsau.edu.ph',
      role: 'ADMIN',
      status: 'Active',
      // Default PBKDF2 hash for "admin123"
      passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      passwordSalt: '0123456789abcdef0123456789abcdef',
    },
  });

  console.log('✅ Legacy migration & seed completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Migration Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
