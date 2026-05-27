'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

const NAV_LINKS = [
  {
    href: '/play',
    label: 'Play',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
  },
  {
    href: '/learn',
    label: 'Learn',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    href: '/track',
    label: 'Track',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: '/rank',
    label: 'Leaderboards',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
];

function AuthSection() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => {
        if (mounted) {
          setUser(data.user);
          setLoading(false);
        }
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) setUser(session?.user ?? null);
      });
      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    });
    return () => { mounted = false; };
  }, []);

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    setUser(null);
    router.push('/play');
  };

  if (loading) {
    return <div className="h-10 rounded-lg bg-[#1E2532] animate-pulse" />;
  }

  if (user) {
    const email = user.email ?? '';
    const initials = email.slice(0, 2).toUpperCase();
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1E2532]">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-xs font-medium text-white truncate">{email}</p>
            <p className="text-[10px] text-text-tertiary">Signed in</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#94A3B8] hover:bg-[#1E2532] hover:text-crimson transition-all duration-150 border border-transparent group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span className="hidden lg:block text-xs font-medium">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Link
        href="/auth/signin"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:bg-[#1E2532] hover:text-white transition-all duration-150 border border-transparent group"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 shrink-0 text-[#64748B] group-hover:text-white">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
        </svg>
        <span className="hidden lg:block text-sm font-medium">Sign In</span>
      </Link>
      <Link
        href="/auth/register"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-150 border border-primary/20"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 shrink-0">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
        </svg>
        <span className="hidden lg:block text-sm font-medium">Register</span>
      </Link>
    </div>
  );
}

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[72px] lg:w-[220px] h-screen sticky top-0 flex flex-col bg-[#151A23] border-r border-[#1E293B] shrink-0 z-30">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1E293B]">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-neon-blue">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <circle cx="12" cy="12" r="9" fill="#1A56FF" />
            <circle cx="8" cy="12" r="2.5" fill="white" />
            <circle cx="16" cy="12" r="2.5" fill="white" />
            <path d="M8 12h8" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <span className="hidden lg:block font-bold text-white text-lg tracking-tight">
          Neogammon
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_LINKS.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                ${isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-[#94A3B8] hover:bg-[#1E2532] hover:text-white border border-transparent'
                }
              `}
            >
              <span className={`shrink-0 ${isActive ? 'text-primary' : 'text-[#64748B] group-hover:text-white'}`}>
                {icon}
              </span>
              <span className="hidden lg:block text-sm font-medium">{label}</span>
              {isActive && <span className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#1E293B]">
        <AuthSection />
      </div>
    </aside>
  );
}
