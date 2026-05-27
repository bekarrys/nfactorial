'use client';

import { useGameStore, type GameMode } from '@/stores/gameStore';
import { useBoardStore } from '@/stores/boardStore';
import { useState, useEffect } from 'react';

interface ModeCard {
  mode: GameMode;
  label: string;
  subtitle: string;
  timeLabel: string;
  accent: string;
  icon: React.ReactNode;
}

const MODE_CARDS: ModeCard[] = [
  {
    mode: 'bullet',
    label: 'Bullet',
    subtitle: '1 min per game',
    timeLabel: '1+0',
    accent: '#DC2626',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    mode: 'blitz',
    label: 'Blitz',
    subtitle: '5 min per game',
    timeLabel: '5+0',
    accent: '#F59E0B',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx={12} cy={12} r={10} />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    mode: 'rapid',
    label: 'Rapid',
    subtitle: '10 min per game',
    timeLabel: '10+0',
    accent: '#16A34A',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x={3} y={3} width={18} height={18} rx={2} />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    mode: 'ai',
    label: 'Neural AI',
    subtitle: 'Instant match vs bot',
    timeLabel: 'AI',
    accent: '#8B5CF6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x={2} y={3} width={20} height={14} rx={2} />
        <path d="M8 21h8M12 17v4" />
        <circle cx={9} cy={10} r={1.5} fill="currentColor" />
        <circle cx={15} cy={10} r={1.5} fill="currentColor" />
      </svg>
    ),
  },
  {
    mode: 'friend',
    label: 'Play Friend',
    subtitle: 'Invite via lobby code',
    timeLabel: 'LOBBY',
    accent: '#06B6D4',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

function SearchingStatus() {
  const { mode, queueStartedAt, leaveQueue } = useGameStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(queueStartedAt ? Math.floor((Date.now() - queueStartedAt) / 1000) : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [queueStartedAt]);

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Finding Opponent</span>
      </div>
      <p className="text-text-secondary text-xs mb-1">
        Mode: <span className="text-white font-medium capitalize">{mode}</span>
      </p>
      <p className="text-text-secondary text-xs">
        Elapsed: <span className="font-mono text-primary">{elapsed}s</span>
      </p>
      <button
        onClick={leaveQueue}
        className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium text-crimson border border-crimson/30 hover:bg-crimson/10 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function ActiveGamePanel() {
  const { mode, opponent, leaveQueue } = useGameStore();
  const { activeTurn, aiThinking, hasRolled, remainingDice, off } = useBoardStore();

  const handleSurrender = () => {
    useBoardStore.getState().resetGame();
    leaveQueue();
  };

  const isAi = mode === 'ai';

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#334155] bg-[#151A23] p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs font-semibold text-success uppercase tracking-wider">Game In Progress</span>
        </div>

        {opponent && (
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#1E293B]">
            <div className="w-8 h-8 rounded-full bg-[#1E2532] flex items-center justify-center text-sm font-bold text-[#8B5CF6]">
              {isAi ? '🤖' : opponent.display_name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{opponent.display_name}</p>
              <p className="text-xs text-text-tertiary font-mono">{opponent.elo_rating} ELO</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#0B0E14] rounded-lg p-2 text-center">
            <p className="text-[10px] text-text-tertiary mb-0.5">Turn</p>
            <p className="text-xs font-bold font-mono text-primary capitalize">
              {aiThinking ? 'AI...' : activeTurn ?? '—'}
            </p>
          </div>
          <div className="bg-[#0B0E14] rounded-lg p-2 text-center">
            <p className="text-[10px] text-text-tertiary mb-0.5">Dice Left</p>
            <p className="text-xs font-bold font-mono text-[#F59E0B]">
              {hasRolled ? remainingDice.length : '?'}
            </p>
          </div>
          <div className="bg-[#0B0E14] rounded-lg p-2 text-center">
            <p className="text-[10px] text-text-tertiary mb-0.5">You Off</p>
            <p className="text-xs font-bold font-mono text-success">{off.white}</p>
          </div>
          <div className="bg-[#0B0E14] rounded-lg p-2 text-center">
            <p className="text-[10px] text-text-tertiary mb-0.5">Opp Off</p>
            <p className="text-xs font-bold font-mono text-crimson">{off.black}</p>
          </div>
        </div>

        <button
          onClick={handleSurrender}
          className="w-full py-2 rounded-lg text-xs font-medium text-crimson border border-crimson/30 hover:bg-crimson/10 transition-colors"
        >
          Resign Game
        </button>
      </div>
    </div>
  );
}

export default function GameControllerPanel() {
  const { mode: activeMode, queueStatus, joinQueue, trainerEnabled, toggleTrainer } = useGameStore();
  const [hoveredMode, setHoveredMode] = useState<GameMode | null>(null);

  const isInGame = queueStatus === 'in_game';
  const isSearching = queueStatus === 'searching';
  const isIdle = queueStatus === 'idle';

  return (
    <aside className="w-full max-w-[280px] flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide py-4 pr-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 rounded-full bg-primary" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Play Now</h2>
      </div>

      {isSearching && <SearchingStatus />}
      {isInGame && <ActiveGamePanel />}

      {isIdle && (
        <div className="space-y-2">
          {MODE_CARDS.map(({ mode, label, subtitle, timeLabel, icon, accent }) => {
            const isHovered = hoveredMode === mode;
            return (
              <button
                key={mode}
                onClick={() => joinQueue(mode)}
                onMouseEnter={() => setHoveredMode(mode)}
                onMouseLeave={() => setHoveredMode(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150 text-left cursor-pointer
                  ${isHovered ? 'border-[#334155] bg-[#1E2532]' : 'border-[#1E293B] bg-[#151A23]'}
                `}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono"
                  style={{ backgroundColor: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
                >
                  {timeLabel}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                  <p className="text-xs text-text-tertiary truncate">{subtitle}</p>
                </div>
                <span style={{ color: isHovered ? accent : '#64748B' }}>{icon}</span>
              </button>
            );
          })}
        </div>
      )}

      {!isInGame && (
        <>
          <div className="border-t border-[#1E293B] my-1" />
          <div className="rounded-xl border border-[#1E293B] bg-[#151A23] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={2} className="w-4 h-4">
                  <circle cx={12} cy={12} r={10} />
                  <path d="M12 8v4l3 3" />
                </svg>
                <span className="text-sm font-semibold text-white">AI Trainer</span>
              </div>
              <button
                onClick={toggleTrainer}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${trainerEnabled ? 'bg-primary' : 'bg-[#334155]'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 shadow-sm ${trainerEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="text-xs text-text-tertiary">
              {trainerEnabled ? 'Move hints enabled. ELO impact reduced.' : 'Enable for real-time move hints.'}
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
