# ALIW Library Management System (Web Edition V2.0)

De La Salle Araneta University

ALIW is a full-stack web app built for De La Salle Araneta University's library. Students search the catalog, borrow books through a QR-based checkout, and track fines. Librarians manage inventory, approve returns, and pull analytics from a single admin dashboard.

## Student Portal

- Catalog search with a 150ms debounce, covering 500+ books with live cover art.
- Book covers pulled from the Open Library and Google Books APIs, cached locally, with a fallback SVG cover when no image is found.
- A borrow cart (up to 5 books per transaction) that generates an encrypted QR pass for checkout at the counter.
- A borrowings page showing active loans, due dates, return history, and a way to request returns online.
- A fines page showing overdue balances at ₱5/day, a way to request payment verification from the cashier, and PDF statement downloads.
- Account settings with avatar upload and password changes (PBKDF2-hashed).

## Admin Portal

- A dashboard with a live clock, a rotating campus background, and six module cards.
- Full CRUD on the book catalog: titles, authors, publication years, categories, and physical copy counts.
- QR scanning or manual entry to check out loans in under a second, filter by status, and log damaged or lost item penalties.
- User management for the full roster (42 student and faculty accounts as of writing), with account creation, active/suspended status toggles, and a password reset approval queue.
- Fine tracking, with filters for paid and unpaid claims.
- Analytics with four Recharts views (top 10 books, category breakdown, top 10 borrowers, loan status), auto-refreshing every 10 seconds, and a PDF export.

## Security

- Passwords are hashed with Node's `crypto.pbkdf2Sync` (SHA-256, 100,000 iterations, 32-byte salt), matching the legacy database byte for byte.
- Five failed login attempts trigger a 30-second lockout.
- Sessions are HTTP-only cookies, checked against role-based access guards on every request.

## Tech Stack

- **Framework:** Next.js 16.3 (App Router, Turbopack)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS v4, Lucide Icons, Framer Motion
- **Database:** SQLite (`dev.db`) via Prisma ORM v5
- **Charts/Data:** Recharts, QRCode.react, XLSX
- **External APIs:** Open Library Search API, Google Books API

## Getting Started

Requires Node.js 18 or later, and npm or yarn.

1. Clone the repo:
```bash
   git clone https://github.com/ziankyle-mi/alis-web.git
   cd alis-web
```
2. Install dependencies:
```bash
   npm install
```
3. Set up the database:
```bash
   npx prisma db push
```
4. Start the dev server:
```bash
   npm run dev
```
5. Open [http://localhost:3000](http://localhost:3000).

Optional: run Prisma Studio to inspect the database directly.
```bash
npx prisma studio --port 5555
```
Then open [http://localhost:5555](http://localhost:5555).

## Test Accounts

| Role | Username | Password | Access |
|---|---|---|---|
| System Administrator | `admin` | `admin123` | Full admin access |
| Demo Student | `student` | `student123` | Student access |
| Zian Kyle | `ziankyle.mi` | `1234` | Student access |
| Huan | `mhuanfrancisco` | `1234` | Student access |

## Team

- **Manuel Zian Kyle Piangco** — Lead Developer & Software Architect
- **Joshua Enriquez** — Full Stack & Backend Engineer
- **Huan Marzan** — Documentation & Paperwork

---

