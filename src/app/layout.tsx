import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DLSAU Library Management System - ALIW Web Edition',
  description: 'De La Salle Araneta University Digital Library Management System V2.0',
  icons: {
    icon: '/images/aliwlogo.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[#F8FAFC] text-gray-900">{children}</body>
    </html>
  );
}
