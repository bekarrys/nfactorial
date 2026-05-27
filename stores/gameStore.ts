'use client';

import { create } from 'zustand';

export type GameMode = 'blitz' | 'bullet' | 'rapid' | 'ai' | 'friend' | 'trainer';
export type QueueStatus = 'idle' | 'searching' | 'found' | 'in_game';

export interface ProfileSummary {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  elo_rating: number;
  skill_tier: string;
  country_code: string;
}

const AI_OPPONENT: ProfileSummary = {
  id: 'ai-bot',
  username: 'NeoBot',
  display_name: 'Neural AI',
  avatar_url: null,
  elo_rating: 1500,
  skill_tier: 'gold',
  country_code: 'KZ',
};

const TIME_CONTROLS: Record<GameMode, number> = {
  bullet: 60,
  blitz: 300,
  rapid: 600,
  ai: 0,
  friend: 600,
  trainer: 999999,
};

interface GameState {
  matchId: string | null;
  mode: GameMode | null;
  queueStatus: QueueStatus;
  queueStartedAt: number | null;
  opponent: ProfileSummary | null;
  myColor: 'white' | 'black' | null;
  result: 'win' | 'loss' | 'draw' | 'resign' | null;
  eloChange: number | null;
  trainerEnabled: boolean;
  timeControl: number;
}

interface GameActions {
  joinQueue: (mode: GameMode) => void;
  leaveQueue: () => void;
  matchFound: (matchId: string, opponent: ProfileSummary, color: 'white' | 'black') => void;
  endGame: (result: GameState['result'], eloChange: number) => void;
  toggleTrainer: () => void;
  setMode: (mode: GameMode) => void;
  setTimeControl: (seconds: number) => void;
  startAiGame: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  matchId: null,
  mode: null,
  queueStatus: 'idle',
  queueStartedAt: null,
  opponent: null,
  myColor: null,
  result: null,
  eloChange: null,
  trainerEnabled: false,
  timeControl: 300,

  joinQueue: (mode) => {
    if (mode === 'ai') {
      get().startAiGame();
      return;
    }
    set({
      mode,
      queueStatus: 'searching',
      queueStartedAt: Date.now(),
      timeControl: TIME_CONTROLS[mode],
      result: null,
      eloChange: null,
    });
  },

  startAiGame: () => {
    const matchId = `ai-${Date.now()}`;
    set({
      mode: 'ai',
      queueStatus: 'in_game',
      queueStartedAt: null,
      opponent: AI_OPPONENT,
      myColor: 'white',
      matchId,
      result: null,
      eloChange: null,
      timeControl: TIME_CONTROLS['ai'],
    });
    import('@/stores/boardStore').then(({ useBoardStore }) => {
      useBoardStore.getState().startGame(true, matchId, 'ai');
    });
  },

  leaveQueue: () =>
    set({ queueStatus: 'idle', queueStartedAt: null, mode: null, opponent: null, matchId: null }),

  matchFound: (matchId, opponent, color) =>
    set({ matchId, opponent, myColor: color, queueStatus: 'in_game' }),

  endGame: (result, eloChange) =>
    set({ result, eloChange, queueStatus: 'idle', matchId: null }),

  toggleTrainer: () =>
    set((s) => ({ trainerEnabled: !s.trainerEnabled })),

  setMode: (mode) =>
    set({ mode, timeControl: TIME_CONTROLS[mode] }),

  setTimeControl: (seconds) => set({ timeControl: seconds }),
}));
