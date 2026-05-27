'use client';

import { useParams } from 'next/navigation';
import BoardCanvas from '@/components/game/BoardCanvas';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
            LESSON #{id}
          </span>
          <h1 className="text-lg font-bold text-white">Puzzle Sandbox</h1>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#151A23] p-4 mb-4">
          <p className="text-sm text-text-secondary">
            Find the best move for the active player. Click a point to select, then click a valid destination.
          </p>
        </div>

        <BoardCanvas />

        <div className="mt-4 flex gap-3">
          <button className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors">
            Submit Move
          </button>
          <button className="px-4 py-2.5 rounded-xl border border-[#334155] text-text-secondary text-sm hover:border-primary hover:text-primary transition-colors">
            Hint
          </button>
        </div>
      </div>
    </div>
  );
}
