'use client';

interface StatCard {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}

const STAT_CARDS: StatCard[] = [
  {
    label: 'Total Matches',
    value: '—',
    sub: 'All time',
    color: '#1A56FF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx={12} cy={12} r={10} />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Win Rate',
    value: '—',
    sub: 'Ranked games',
    color: '#16A34A',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    label: 'Blitz ELO',
    value: '1000',
    sub: 'Starting rating',
    color: '#F59E0B',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    label: 'Bullet ELO',
    value: '1000',
    sub: 'Starting rating',
    color: '#DC2626',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx={12} cy={12} r={10} />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    label: 'Avg Pip Count',
    value: '—',
    sub: 'Efficiency metric',
    color: '#8B5CF6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Blot Safety',
    value: '—',
    sub: 'Risk coefficient',
    color: '#06B6D4',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {STAT_CARDS.map(({ label, value, sub, color, icon }) => (
        <div
          key={label}
          className="rounded-xl border border-[#1E293B] bg-[#151A23] p-4 hover:border-[#334155] transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">{label}</span>
            <span style={{ color }}>{icon}</span>
          </div>
          <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
          {sub && <p className="text-xs text-text-tertiary mt-1">{sub}</p>}
        </div>
      ))}
    </div>
  );
}
