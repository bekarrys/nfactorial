export default function LearnPage() {
  const CATEGORIES = [
    { label: 'Beginner', count: 12, color: '#16A34A', description: 'Fundamentals, opening theory, basic tactics' },
    { label: 'Intermediate', count: 20, color: '#F59E0B', description: 'Priming, back game, pip counting' },
    { label: 'Master', count: 15, color: '#8B5CF6', description: 'Advanced cube strategy, match play theory' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background px-6 py-6 overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h1 className="text-2xl font-bold text-white">Learn Backgammon</h1>
          </div>
          <p className="text-text-secondary text-sm ml-3">Structured lessons and interactive puzzles</p>
        </div>

        {/* Progress Bar */}
        <div className="rounded-xl border border-[#1E293B] bg-[#151A23] p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Overall Progress</span>
            <span className="text-xs font-mono text-primary">0 / 47 completed</span>
          </div>
          <div className="h-2 bg-[#1E2532] rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Category Roadmap */}
        <div className="space-y-4">
          {CATEGORIES.map(({ label, count, color, description }, i) => (
            <div key={label} className="rounded-xl border border-[#1E293B] bg-[#151A23] p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{label}</h3>
                    <p className="text-xs text-text-tertiary">{description}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-text-secondary">{count} lessons</span>
              </div>
              <div className="h-1.5 bg-[#1E2532] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '0%', backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
