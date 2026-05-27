'use client';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  master: '#FF00FF',
};

interface PlayerHUDProps {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  countryCode?: string;
  eloRating: number;
  skillTier: string;
  isActive: boolean;
  position: 'top' | 'bottom';
  timeLeft?: number;
}

function TierBadge({ tier }: { tier: string }) {
  const color = TIER_COLORS[tier] ?? '#CD7F32';
  return (
    <span
      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-widest"
      style={{ color, border: `1px solid ${color}40`, backgroundColor: `${color}15` }}
    >
      {tier}
    </span>
  );
}

function Avatar({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return <img src={url} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#334155]" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[#1E2532] ring-2 ring-[#334155] flex items-center justify-center text-sm font-bold text-text-secondary">
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function PlayerHUD({
  username,
  displayName,
  avatarUrl,
  countryCode = 'KZ',
  eloRating,
  skillTier,
  isActive,
  position,
  timeLeft,
}: PlayerHUDProps) {
  const mins = timeLeft !== undefined ? Math.floor(timeLeft / 60) : null;
  const secs = timeLeft !== undefined ? timeLeft % 60 : null;
  const isLowTime = timeLeft !== undefined && timeLeft < 30;

  return (
    <div
      className={`
        flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200
        ${isActive
          ? 'border-primary/40 bg-[#151A23] shadow-neon-blue'
          : 'border-[#1E293B] bg-[#0F1520]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar url={avatarUrl} name={displayName} />
          {isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-[#0B0E14]" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white leading-tight">{displayName}</span>
            <span className="text-xs text-text-tertiary font-mono">{countryCode}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono text-primary font-bold">{eloRating}</span>
            <TierBadge tier={skillTier} />
          </div>
        </div>
      </div>

      {/* Timer */}
      {timeLeft !== undefined && (
        <div
          className={`
            font-mono text-lg font-bold px-3 py-1 rounded-lg
            ${isLowTime ? 'text-crimson bg-crimson/10 animate-pulse' : isActive ? 'text-white bg-[#1E2532]' : 'text-text-tertiary bg-[#0B0E14]'}
          `}
        >
          {mins}:{String(secs).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
