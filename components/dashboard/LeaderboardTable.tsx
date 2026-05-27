'use client';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  master: '#FF00FF',
};

const MOCK_ROWS = [
  { rank: 1, username: 'Darkhan_Pro', displayName: 'Darkhan S.', elo: 2341, tier: 'master', region: 'Almaty', wins: 312, matches: 350 },
  { rank: 2, username: 'NardyKing', displayName: 'Ruslan T.', elo: 2198, tier: 'diamond', region: 'Astana', wins: 280, matches: 330 },
  { rank: 3, username: 'SteppeKnight', displayName: 'Aigerim K.', elo: 2050, tier: 'diamond', region: 'Almaty', wins: 245, matches: 300 },
  { rank: 4, username: 'ZhetysuPlayer', displayName: 'Erlan M.', elo: 1920, tier: 'platinum', region: 'Taldykorgan', wins: 190, matches: 240 },
  { rank: 5, username: 'NomadGammon', displayName: 'Asel B.', elo: 1800, tier: 'platinum', region: 'Astana', wins: 160, matches: 210 },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-[#FFD700] font-bold text-sm">1st</span>;
  if (rank === 2) return <span className="text-[#C0C0C0] font-bold text-sm">2nd</span>;
  if (rank === 3) return <span className="text-[#CD7F32] font-bold text-sm">3rd</span>;
  return <span className="text-text-tertiary font-mono text-sm">#{rank}</span>;
}

export default function LeaderboardTable() {
  return (
    <div className="rounded-xl border border-[#1E293B] overflow-hidden">
      {/* Column Headers */}
      <div className="grid grid-cols-[40px_1fr_100px_80px_80px_80px] gap-0 bg-[#151A23] px-4 py-2.5 border-b border-[#1E293B]">
        <span className="text-[10px] font-semibold text-text-tertiary uppercase">#</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase">Player</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase text-right">Region</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase text-right">ELO</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase text-right">W/L</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase text-right">Win%</span>
      </div>

      {/* Rows */}
      {MOCK_ROWS.map((row, i) => {
        const winRate = ((row.wins / row.matches) * 100).toFixed(1);
        const tierColor = TIER_COLORS[row.tier] ?? '#CD7F32';
        return (
          <div
            key={row.username}
            className={`
              grid grid-cols-[40px_1fr_100px_80px_80px_80px] gap-0 px-4 py-3 border-b border-[#1E293B] transition-colors hover:bg-[#1E2532] cursor-pointer
              ${i === 0 ? 'bg-[#FFD700]/5' : i === 1 ? 'bg-[#C0C0C0]/3' : ''}
            `}
          >
            <div className="flex items-center">
              <RankBadge rank={row.rank} />
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
              >
                {row.displayName[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{row.displayName}</p>
                <p className="text-[10px] text-text-tertiary font-mono">{row.username}</p>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs text-text-secondary">{row.region}</span>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-sm font-bold font-mono text-primary">{row.elo}</span>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs font-mono text-text-secondary">{row.wins}/{row.matches - row.wins}</span>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs font-mono text-success">{winRate}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
