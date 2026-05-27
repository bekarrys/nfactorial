'use client';

import { create } from 'zustand';

export type PlayerColor = 'white' | 'black';

export interface PointState {
  count: number;
  color: PlayerColor | null;
}

export interface BoardStateData {
  points: PointState[];
  bar: Record<PlayerColor, number>;
  off: Record<PlayerColor, number>;
}

interface BoardState extends BoardStateData {
  activeTurn: PlayerColor | null;
  dice: number[];
  remainingDice: number[];
  selectedPoint: number | null;
  validMoves: number[];
  lastMove: { from: number; to: number } | null;
  hasRolled: boolean;
  isAiMode: boolean;
  aiThinking: boolean;
  matchId: string | null;
  gameMode: string | null;
}

interface BoardActions {
  startGame: (isAi: boolean, matchId?: string | null, gameMode?: string | null) => void;
  resetGame: () => void;
  rollDice: () => void;
  selectPoint: (index: number) => void;
  executeMove: (from: number, to: number, dieValue: number) => void;
  runAiTurn: () => void;
  resetSelection: () => void;
  syncFromServer: (serverState: Partial<BoardStateData & Pick<BoardState, 'activeTurn' | 'dice'>>) => void;
}

const INITIAL_POINTS = (): PointState[] => {
  const pts: PointState[] = Array(24).fill(null).map(() => ({ count: 0, color: null }));
  pts[0]  = { count: 2, color: 'white' };
  pts[5]  = { count: 5, color: 'black' };
  pts[7]  = { count: 3, color: 'black' };
  pts[11] = { count: 5, color: 'white' };
  pts[12] = { count: 5, color: 'black' };
  pts[16] = { count: 3, color: 'white' };
  pts[18] = { count: 5, color: 'white' };
  pts[23] = { count: 2, color: 'black' };
  return pts;
};

function rollTwo(): number[] {
  const d1 = Math.ceil(Math.random() * 6);
  const d2 = Math.ceil(Math.random() * 6);
  return d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
}

function canLandOn(pt: PointState, mover: PlayerColor): boolean {
  if (pt.color === null) return true;
  if (pt.color === mover) return true;
  return pt.count === 1;
}

function getValidMovesForPiece(
  index: number,
  color: PlayerColor,
  points: PointState[],
  bar: Record<PlayerColor, number>,
  remainingDice: number[]
): number[] {
  const direction = color === 'white' ? 1 : -1;
  const uniqueDice = [...new Set(remainingDice)];
  const targets: number[] = [];

  if (bar[color] > 0 && index !== 24) return [];
  if (bar[color] > 0 && index === 24) {
    for (const die of uniqueDice) {
      const to = color === 'white' ? die - 1 : 24 - die;
      if (to >= 0 && to <= 23 && canLandOn(points[to], color)) {
        targets.push(to);
      }
    }
    return [...new Set(targets)];
  }

  for (const die of uniqueDice) {
    const to = index + die * direction;
    if (to >= 0 && to <= 23 && canLandOn(points[to], color)) {
      targets.push(to);
    }
  }
  return [...new Set(targets)];
}

function applyMove(
  points: PointState[],
  bar: Record<PlayerColor, number>,
  off: Record<PlayerColor, number>,
  from: number,
  to: number,
  mover: PlayerColor
): { points: PointState[]; bar: Record<PlayerColor, number>; off: Record<PlayerColor, number> } {
  const newPoints = points.map((p) => ({ ...p }));
  const newBar = { ...bar };
  const newOff = { ...off };
  const opponent: PlayerColor = mover === 'white' ? 'black' : 'white';

  if (from === 24) {
    newBar[mover] = Math.max(0, newBar[mover] - 1);
  } else {
    newPoints[from] = {
      count: newPoints[from].count - 1,
      color: newPoints[from].count - 1 === 0 ? null : mover,
    };
  }

  if (to === 25) {
    newOff[mover] += 1;
    return { points: newPoints, bar: newBar, off: newOff };
  }

  const target = newPoints[to];
  if (target.color === opponent && target.count === 1) {
    newPoints[to] = { count: 1, color: mover };
    newBar[opponent] += 1;
  } else {
    newPoints[to] = { count: target.count + 1, color: mover };
  }

  return { points: newPoints, bar: newBar, off: newOff };
}

function computeAiMoves(
  points: PointState[],
  bar: Record<PlayerColor, number>,
  off: Record<PlayerColor, number>,
  dice: number[]
): Array<{ from: number; to: number; die: number }> {
  const moves: Array<{ from: number; to: number; die: number }> = [];
  let curPoints = points.map((p) => ({ ...p }));
  let curBar = { ...bar };
  let curOff = { ...off };
  let remaining = [...dice];

  while (remaining.length > 0) {
    const uniqueDice = [...new Set(remaining)];
    let madeMove = false;

    for (const die of uniqueDice) {
      const candidates: Array<{ from: number; to: number; die: number; priority: number }> = [];

      if (curBar.black > 0) {
        const to = 24 - die;
        if (to >= 0 && to <= 23 && canLandOn(curPoints[to], 'black')) {
          const isHit = curPoints[to].color === 'white' && curPoints[to].count === 1;
          candidates.push({ from: 24, to, die, priority: isHit ? 10 : 1 });
        }
      } else {
        for (let i = 23; i >= 0; i--) {
          if (curPoints[i].color !== 'black' || curPoints[i].count === 0) continue;
          const to = i - die;
          if (to >= 0 && canLandOn(curPoints[to], 'black')) {
            const isHit = curPoints[to].color === 'white' && curPoints[to].count === 1;
            const isMakePoint = curPoints[to].color === 'black' && curPoints[to].count >= 1;
            candidates.push({ from: i, to, die, priority: isHit ? 10 : isMakePoint ? 5 : 1 });
          }
        }
      }

      if (candidates.length === 0) continue;

      candidates.sort((a, b) => b.priority - a.priority);
      const chosen = candidates[0];
      moves.push(chosen);

      const result = applyMove(curPoints, curBar, curOff, chosen.from, chosen.to, 'black');
      curPoints = result.points;
      curBar = result.bar;
      curOff = result.off;

      const idx = remaining.indexOf(die);
      remaining.splice(idx, 1);
      madeMove = true;
      break;
    }

    if (!madeMove) break;
  }

  return moves;
}

async function syncBoardToSupabase(matchId: string, boardData: BoardStateData) {
  try {
    const { supabase } = await import('@/lib/supabase');
    await supabase
      .from('matches')
      .update({ current_board_state: boardData })
      .eq('id', matchId);
  } catch {
    // Non-critical — multiplayer sync failure doesn't break local state
  }
}

export const useBoardStore = create<BoardState & BoardActions>((set, get) => ({
  points: INITIAL_POINTS(),
  bar: { white: 0, black: 0 },
  off: { white: 0, black: 0 },
  activeTurn: null,
  dice: [],
  remainingDice: [],
  selectedPoint: null,
  validMoves: [],
  lastMove: null,
  hasRolled: false,
  isAiMode: false,
  aiThinking: false,
  matchId: null,
  gameMode: null,

  startGame: (isAi, matchId = null, gameMode = null) => {
    set({
      points: INITIAL_POINTS(),
      bar: { white: 0, black: 0 },
      off: { white: 0, black: 0 },
      activeTurn: 'white',
      dice: [],
      remainingDice: [],
      selectedPoint: null,
      validMoves: [],
      lastMove: null,
      hasRolled: false,
      isAiMode: isAi,
      aiThinking: false,
      matchId,
      gameMode,
    });
  },

  resetGame: () => {
    set({
      points: INITIAL_POINTS(),
      bar: { white: 0, black: 0 },
      off: { white: 0, black: 0 },
      activeTurn: null,
      dice: [],
      remainingDice: [],
      selectedPoint: null,
      validMoves: [],
      lastMove: null,
      hasRolled: false,
      isAiMode: false,
      aiThinking: false,
      matchId: null,
      gameMode: null,
    });
  },

  rollDice: () => {
    const { activeTurn, hasRolled } = get();
    if (!activeTurn || hasRolled) return;
    const newDice = rollTwo();
    set({ dice: newDice, remainingDice: [...newDice], hasRolled: true });
  },

  selectPoint: (index) => {
    const { points, activeTurn, bar, remainingDice } = get();
    if (!activeTurn || remainingDice.length === 0) return;

    if (bar[activeTurn] > 0 && index !== 24) {
      set({ selectedPoint: null, validMoves: [] });
      return;
    }

    const pt = index === 24 ? { count: bar[activeTurn], color: activeTurn } : points[index];
    if (!pt || pt.color !== activeTurn || pt.count === 0) {
      set({ selectedPoint: null, validMoves: [] });
      return;
    }

    const targets = getValidMovesForPiece(index, activeTurn, points, bar, remainingDice);
    set({ selectedPoint: index, validMoves: targets });
  },

  executeMove: (from, to, dieValue) => {
    const { points, bar, off, activeTurn, remainingDice, isAiMode, matchId, gameMode } = get();
    if (!activeTurn) return;

    const result = applyMove(points, bar, off, from, to, activeTurn);

    const dieIdx = remainingDice.indexOf(dieValue);
    const newRemaining = [...remainingDice];
    if (dieIdx !== -1) newRemaining.splice(dieIdx, 1);

    const boardData: BoardStateData = { points: result.points, bar: result.bar, off: result.off };

    set({
      ...boardData,
      remainingDice: newRemaining,
      selectedPoint: null,
      validMoves: [],
      lastMove: { from, to },
    });

    if (matchId && gameMode && ['bullet', 'blitz', 'rapid', 'friend'].includes(gameMode)) {
      syncBoardToSupabase(matchId, boardData);
    }

    if (newRemaining.length === 0) {
      const nextTurn: PlayerColor = activeTurn === 'white' ? 'black' : 'white';
      setTimeout(() => {
        set({ activeTurn: nextTurn, hasRolled: false, dice: [], remainingDice: [] });
        if (isAiMode && nextTurn === 'black') {
          get().runAiTurn();
        }
      }, 400);
    }
  },

  runAiTurn: () => {
    set({ aiThinking: true });
    setTimeout(() => {
      const { points, bar, off } = get();
      const aiDice = rollTwo();
      set({ dice: aiDice, remainingDice: [...aiDice], hasRolled: true });

      const aiMoves = computeAiMoves(points, bar, off, aiDice);

      let delay = 600;
      let curPoints = points.map((p) => ({ ...p }));
      let curBar = { ...bar };
      let curOff = { ...off };

      for (const move of aiMoves) {
        const result = applyMove(curPoints, curBar, curOff, move.from, move.to, 'black');
        curPoints = result.points;
        curBar = result.bar;
        curOff = result.off;

        const snapshot = { points: result.points, bar: result.bar, off: result.off };
        const dieV = move.die;
        setTimeout(() => {
          set((s) => {
            const rem = [...s.remainingDice];
            const idx = rem.indexOf(dieV);
            if (idx !== -1) rem.splice(idx, 1);
            return { ...snapshot, remainingDice: rem, lastMove: { from: move.from, to: move.to } };
          });
        }, delay);
        delay += 500;
      }

      setTimeout(() => {
        set({ activeTurn: 'white', hasRolled: false, dice: [], remainingDice: [], aiThinking: false });
      }, delay + 200);
    }, 800);
  },

  resetSelection: () => set({ selectedPoint: null, validMoves: [] }),

  syncFromServer: (serverState) => set((prev) => ({ ...prev, ...serverState })),
}));

