import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Glitched',
  description: 'Glitched — the digital school square for Westminster Islamabad Academy.',
  manifest: '/manifest.json',
};


 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-paper font-body">
        <Navbar />
        <main className="px-4 pb-24 pt-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
 