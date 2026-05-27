import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LeftSidebar from '@/components/shared/LeftSidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Neogammon — Elite Backgammon Platform',
  description: 'Competitive backgammon with real-time matchmaking, AI trainer, and leaderboards.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <body className="min-h-screen bg-background text-text-primary antialiased flex">
        {/* Left navigation sidebar */}
        <LeftSidebar />

        {/* Main content area — fills remaining width */}
        <main className="flex-1 min-h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
