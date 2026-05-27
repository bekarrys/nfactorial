'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { supabase } = await import('@/lib/supabase');
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/play');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <circle cx="12" cy="12" r="9" fill="#1A56FF" />
              <circle cx="8" cy="12" r="2.5" fill="white" />
              <circle cx="16" cy="12" r="2.5" fill="white" />
              <path d="M8 12h8" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-text-secondary text-sm">Sign in to your Neogammon account</p>
        </div>

        <div className="bg-[#151A23] border border-[#1E293B] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 bg-[#0B0E14] border border-[#334155] rounded-lg text-white text-sm placeholder-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-[#0B0E14] border border-[#334155] rounded-lg text-white text-sm placeholder-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-crimson/10 border border-crimson/30">
                <p className="text-xs text-crimson">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#1E293B] text-center">
            <p className="text-xs text-text-tertiary">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/play" className="text-xs text-text-tertiary hover:text-white transition-colors">
            ← Continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
