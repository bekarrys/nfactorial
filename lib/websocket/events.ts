import type { ProfileSummary } from '@/stores/gameStore';
import type { BoardStateData } from '@/stores/boardStore';

export type GameMode = 'blitz' | 'bullet' | 'rapid' | 'ai' | 'friend' | 'trainer';

export interface Move {
  from: number;
  to: number;
  diceUsed: number;
  isHit?: boolean;
  isBearingOff?: boolean;
}

export interface GameResult {
  winnerId: string;
  result: 'win' | 'loss' | 'draw' | 'resign';
  gammon?: boolean;
  backgammon?: boolean;
}

export interface EloChange {
  white: number;
  black: number;
}

export type WSEvent =
  | { type: 'QUEUE_JOIN'; payload: { queueId: string; mode: GameMode; difficulty?: number } }
  | { type: 'QUEUE_MATCH_FOUND'; payload: { matchId: string; opponent: ProfileSummary } }
  | { type: 'MATCH_JOINED'; payload: { matchId: string; boardState: BoardStateData; color: 'white' | 'black' } }
  | { type: 'DICE_ROLLED'; payload: { dice: [number, number]; playerId: string } }
  | { type: 'MOVE_VALIDATED'; payload: { move: Move; isValid: boolean; reason?: string } }
  | { type: 'MOVE_EXECUTED'; payload: { move: Move; newBoardState: BoardStateData; turn: string } }
  | { type: 'TURN_CHANGED'; payload: { newTurn: string; dice: [number, number] } }
  | { type: 'MATCH_COMPLETED'; payload: { result: GameResult; winnerId: string; eloChanges: EloChange } };
