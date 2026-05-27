'use client';

import { useParams } from 'next/navigation';
import BoardCanvas from '@/components/game/BoardCanvas';
import PlayerHUD from '@/components/game/PlayerHUD';
import { useGameStore } from '@/stores/gameStore';

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const { opponent, myColor, trainerEnabled } = useGameStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-3">
        {/* Opponent HUD */}
        <div className="w-full max-w-[700px]">
          {opponent ? (
            <PlayerHUD
              username={opponent.username}
              displayName={opponent.display_name}
              avatarUrl={opponent.avatar_url}
              eloRating={opponent.elo_rating}
              skillTier={opponent.skill_tier}
              countryCode={opponent.country_code}
              isActive={myColor === 'black'}
              position="top"
              timeLeft={300}
            />
          ) : (
            <div className="h-14 rounded-xl bg-[#151A23] border border-[#1E293B] animate-pulse" />
          )}
        </div>

        {/* Board */}
        <BoardCanvas />

        {/* Trainer overlay hint */}
        {trainerEnabled && (
          <div className="w-full max-w-[700px] px-3 py-2 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-xs text-[#A78BFA] font-mono">
            AI Trainer active — move quality evaluated after each turn
          </div>
        )}

        {/* Player HUD */}
        <div className="w-full max-w-[700px]">
          <PlayerHUD
            username="you"
            displayName="You"
            eloRating={1200}
            skillTier="silver"
            countryCode="KZ"
            isActive={myColor === 'white'}
            position="bottom"
            timeLeft={300}
          />
        </div>
      </div>
    </div>
  );
}
