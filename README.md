# De La Salle Araneta University — ALIW Library Management System (Web Edition V2.0)

![Next.js 16](https://img.shields.io/badge/Next.js-16.3.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

The **ALIW Library Management System (Web Edition V2.0)** is a modern full-stack web application designed for De La Salle Araneta University. It connects students and librarians with real-time digital catalog search, Open Library book cover artwork integration, cart-based digital QR borrow passes, fine tracking, automated PDF billing statements, and live interactive analytics reports.

---

## 🌟 Key Features

### 🎓 Student Portal
- **Instant Auto-Suggest Catalog Search**: Fast 150ms debounce search through 500+ library collection books with live cover artwork.
- **Open Library & Google Books API Proxy**: Automatically fetches and caches high-resolution book cover artwork online, with a fallback SVG cover generator.
- **Borrow Cart & Digital QR Pass**: Add up to 5 books per transaction and generate encrypted digital QR passes for instant counter checkout.
- **My Borrowings & Online Return Requests**: Track active loans, due dates, return history, and request book returns online.
- **My Fines & PDF Statement Download**: View overdue balances (₱5/day policy), request cashier payment verifications, and export official PDF billing statements.
- **Account Settings & Avatar Upload**: Custom profile picture uploads with circular ring previews, account information, and PBKDF2 password updates.

### 🛡️ Admin Portal
- **Dashboard & Live Digital Clock**: 6-module grid with real-time digital clock, campus background slideshow, and dark cinematic overlay.
- **Books Inventory Management**: CRUD operations for catalog titles, author info, publication years, category filters, and physical copy tracking.
- **Student Borrowing & QR Verification**: Scan or enter student QR transaction IDs to complete checkout in 0.5s, filter loans by status, and process damaged/lost item penalties.
- **User Management & Reset Queue**: Full roster of 42 student & faculty accounts, Add New User modal, status toggle (Active/Suspended), and Password Reset approval queue.
- **Fine Management**: Track overdue penalties, filter paid/unpaid claims, and mark settled fines.
- **Analytics & PDF Export**: 4 interactive Recharts charts (Top 10 Popular Books, Category Breakdown, Top 10 Student Borrowers, Loan Status Overview), 10s auto-refresh loop, and **Export PDF Report** functionality.

---

## 🔐 Security & Password Parity

- **PBKDF2 Hashing**: Uses Node.js `crypto.pbkdf2Sync` (SHA-256 with 100,000 iterations and 32-byte salt) ensuring 100% byte-for-byte compatibility with legacy database passwords.
- **Rate-Limiting Lockout**: 5 consecutive failed login attempts trigger a 30-second security lockout timer.
- **Session Management**: Cookie-based HTTP-only session verification with role authorization guards.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.3 (Turbopack App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Database & ORM**: SQLite (`dev.db`) with Prisma ORM v5
- **Charts & Data**: Recharts, QRCode.react, XLSX
- **APIs**: Open Library Search API, Google Books API

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ziankyle-mi/alis-web.git
   cd alis-web
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

6. **(Optional) Open Prisma Studio**:
   ```bash
   npx prisma studio --port 5555
   ```
   Navigate to [http://localhost:5555](http://localhost:5555) to visually inspect your SQLite database.

---

## 🔑 Test Account Credentials

| Role | Username / Email | Password | Access Level |
|---|---|---|---|
| **System Administrator** | `admin` | `admin123` | Full Admin Access |
| **Demo Student** | `student` | `student123` | Student Access |
| **Zian Kyle Account** | `ziankyle.mi` | `1234` | Student Access |
| **Huan Account** | `mhuanfrancisco` | `1234` | Student Access |

---

## 👥 Project Team & Credits

- **Manuel Zian Kyle Piangco** — *Lead Developer & Software Architect * 
- **Joshua Enriquez** — *Full Stack & Backend Engineer* ⚙️
- **Huan Marzan** — *Documentation & Paperwork Specialist* 📝

---

&copy; 2026 De La Salle Araneta University. All rights reserved.
