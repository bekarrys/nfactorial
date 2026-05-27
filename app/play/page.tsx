'use client';

import GameControllerPanel from '@/components/game/GameControllerPanel';
import BoardCanvas from '@/components/game/BoardCanvas';
import PlayerHUD from '@/components/game/PlayerHUD';
import { useGameStore } from '@/stores/gameStore';
import { useBoardStore } from '@/stores/boardStore';

const GUEST_PROFILE = {
  username: 'guest',
  displayName: 'You',
  eloRating: 1200,
  skillTier: 'bronze',
  countryCode: 'KZ',
};

function EmptyBoardPlaceholder() {
  return (
    <div className="w-full max-w-[700px] mx-auto">
      <div
        className="rounded-xl border border-[#1E293B] bg-[#151A23] flex flex-col items-center justify-center gap-4"
        style={{ aspectRatio: '700/480' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1A56FF" strokeWidth={1.5} className="w-8 h-8">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-base mb-1">Select a game mode</p>
          <p className="text-text-tertiary text-sm">Choose from the panel to start playing</p>
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const { queueStatus, opponent, myColor } = useGameStore();
  const { activeTurn, aiThinking } = useBoardStore();

  const isInGame = queueStatus === 'in_game';
  const isPlayerTurn = activeTurn === 'white';
  const isOpponentTurn = activeTurn === 'black' || aiThinking;

  const opponentHUD = opponent
    ? {
        username: opponent.username,
        displayName: opponent.display_name,
        avatarUrl: opponent.avatar_url,
        eloRating: opponent.elo_rating,
        skillTier: opponent.skill_tier,
        countryCode: opponent.country_code,
      }
    : { username: 'waiting', displayName: 'Waiting...', eloRating: 0, skillTier: 'bronze', countryCode: 'KZ' };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-4 lg:px-6 py-4 gap-3 overflow-hidden min-w-0">
        <div className="w-full max-w-[700px]">
          {isInGame ? (
            <PlayerHUD
              {...opponentHUD}
              isActive={isOpponentTurn}
              position="top"
            />
          ) : (
            <div className="h-14 rounded-xl bg-[#0F1520] border border-[#1E293B] flex items-center px-4">
              <p className="text-text-tertiary text-sm">Select a game mode to start →</p>
            </div>
          )}
        </div>

        {isInGame ? <BoardCanvas /> : <EmptyBoardPlaceholder />}

        <div className="w-full max-w-[700px]">
          {isInGame ? (
            <PlayerHUD
              {...GUEST_PROFILE}
              isActive={isPlayerTurn}
              position="bottom"
            />
          ) : (
            <div className="h-14 rounded-xl bg-[#0F1520] border border-[#1E293B]" />
          )}
        </div>
      </div>

      <div className="hidden xl:flex items-start pt-6 overflow-y-auto shrink-0">
        <GameControllerPanel />
      </div>

      {/* Mobile game controller — bottom sheet trigger on sm/lg */}
      <div className="xl:hidden fixed bottom-4 right-4 z-40">
        <div className="bg-[#151A23] border border-[#334155] rounded-2xl p-2 shadow-card">
          <GameControllerPanel />
        </div>
      </div>
    </div>
  );
}
