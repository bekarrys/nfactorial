'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username may only contain letters, numbers, and underscores.');
      return;
    }
    if (username.length < 3 || username.length > 50) {
      setError('Username must be between 3 and 50 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { username, display_name: username },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          username: username.trim(),
          display_name: username.trim(),
          country_code: 'KZ',
          role: 'player',
          skill_tier: 'bronze',
          elo_rating: 1000,
          elo_blitz: 1000,
          elo_bullet: 1000,
          elo_rapid: 1000,
          elo_puzzles: 1000,
        });

        if (profileError && profileError.code !== '23505') {
          setError(`Profile creation failed: ${profileError.message}`);
          return;
        }
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
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-text-secondary text-sm">Join Neogammon and start competing</p>
        </div>

        <div className="bg-[#151A23] border border-[#1E293B] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="your_username"
                className="w-full px-3 py-2.5 bg-[#0B0E14] border border-[#334155] rounded-lg text-white text-sm placeholder-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
              <p className="mt-1 text-[10px] text-text-tertiary">Letters, numbers, and underscores only</p>
            </div>

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
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2.5 bg-[#0B0E14] border border-[#334155] rounded-lg text-white text-sm placeholder-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 bg-[#0B0E14] border rounded-lg text-white text-sm placeholder-text-tertiary focus:outline-none transition-colors ${
                  confirm && confirm !== password
                    ? 'border-crimson focus:border-crimson focus:ring-crimson/30'
                    : 'border-[#334155] focus:border-primary focus:ring-primary/30'
                } focus:ring-1`}
              />
              {confirm && confirm !== password && (
                <p className="mt-1 text-[10px] text-crimson">Passwords don&apos;t match</p>
              )}
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-crimson/10 border border-crimson/30">
                <p className="text-xs text-crimson">{error}</p>
              </div>
            )}

            <div className="rounded-lg bg-[#0B0E14] border border-[#1E293B] p-3">
              <p className="text-[10px] text-text-tertiary leading-relaxed">
                By registering, you&apos;ll start with{' '}
                <span className="text-primary font-semibold">1000 ELO</span>{' '}
                across all game modes and a{' '}
                <span className="text-[#CD7F32] font-semibold">Bronze tier</span>{' '}
                ranking badge.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || (confirm !== '' && confirm !== password)}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#1E293B] text-center">
            <p className="text-xs text-text-tertiary">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                Sign in
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
