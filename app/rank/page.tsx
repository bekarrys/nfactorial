import LeaderboardTable from '@/components/dashboard/LeaderboardTable';

export default function RankPage() {
  return (
    <div className="flex flex-col h-screen bg-background px-6 py-6 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h1 className="text-2xl font-bold text-white">Leaderboards</h1>
          </div>
          <p className="text-text-secondary text-sm ml-3">Top-rated players globally and by region</p>
        </div>

        {/* Region Filter */}
        <div className="flex gap-2 mb-6">
          {['Global', 'Kazakhstan', 'Almaty', 'Astana'].map((region) => (
            <button
              key={region}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                ${region === 'Global'
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-[#151A23] text-text-secondary border-[#1E293B] hover:border-[#334155] hover:text-white'
                }
              `}
            >
              {region}
            </button>
          ))}
        </div>

        <LeaderboardTable />
      </div>
    </div>
  );
}
