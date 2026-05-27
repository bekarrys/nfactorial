'use client';

import { create } from 'zustand';
import type { ProfileSummary } from './gameStore';

export interface LobbyMember extends ProfileSummary {
  isHost: boolean;
  isReady: boolean;
  isMuted: boolean;
}

export interface LobbyRoom {
  id: string;
  code: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  isPrivate: boolean;
  gameMode: string;
  members: LobbyMember[];
}

interface LobbyState {
  currentLobby: LobbyRoom | null;
  pendingInvites: { lobbyId: string; from: ProfileSummary }[];
  isConnecting: boolean;
}

interface LobbyActions {
  joinLobby: (lobby: LobbyRoom) => void;
  leaveLobby: () => void;
  setReady: (userId: string, ready: boolean) => void;
  memberJoined: (member: LobbyMember) => void;
  memberLeft: (userId: string) => void;
  addInvite: (lobbyId: string, from: ProfileSummary) => void;
  dismissInvite: (lobbyId: string) => void;
  setConnecting: (v: boolean) => void;
}

export const useLobbyStore = create<LobbyState & LobbyActions>((set) => ({
  currentLobby: null,
  pendingInvites: [],
  isConnecting: false,

  joinLobby: (lobby) => set({ currentLobby: lobby, isConnecting: false }),

  leaveLobby: () => set({ currentLobby: null }),

  setReady: (userId, ready) =>
    set((s) => {
      if (!s.currentLobby) return s;
      return {
        currentLobby: {
          ...s.currentLobby,
          members: s.currentLobby.members.map((m) =>
            m.id === userId ? { ...m, isReady: ready } : m
          ),
        },
      };
    }),

  memberJoined: (member) =>
    set((s) => {
      if (!s.currentLobby) return s;
      return {
        currentLobby: {
          ...s.currentLobby,
          members: [...s.currentLobby.members, member],
        },
      };
    }),

  memberLeft: (userId) =>
    set((s) => {
      if (!s.currentLobby) return s;
      return {
        currentLobby: {
          ...s.currentLobby,
          members: s.currentLobby.members.filter((m) => m.id !== userId),
        },
      };
    }),

  addInvite: (lobbyId, from) =>
    set((s) => ({
      pendingInvites: [...s.pendingInvites, { lobbyId, from }],
    })),

  dismissInvite: (lobbyId) =>
    set((s) => ({
      pendingInvites: s.pendingInvites.filter((i) => i.lobbyId !== lobbyId),
    })),

  setConnecting: (v) => set({ isConnecting: v }),
}));
