import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { MAX_PLAYERS, MIN_PLAYERS } from '../engine/constants';
import type { BotDifficulty, PlayerConfig } from '../engine/types';

interface LobbyPlayer {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty: BotDifficulty;
}

interface LobbyStore {
  players: LobbyPlayer[];
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, updates: Partial<LobbyPlayer>) => void;
  toggleBot: (id: string) => void;
  canStartGame: () => boolean;
  getPlayerConfigs: () => PlayerConfig[];
  reset: () => void;
}

const createDefaultPlayers = (): LobbyPlayer[] => [
  {
    id: nanoid(),
    name: 'Player 1',
    isBot: false,
    botDifficulty: 'easy',
  },
  {
    id: nanoid(),
    name: 'Player 2',
    isBot: false,
    botDifficulty: 'easy',
  },
];

function getNextPlayerName(players: LobbyPlayer[]): string {
  const takenNames = new Set(players.map((player) => player.name));
  let index = players.length + 1;

  while (takenNames.has(`Player ${index}`)) {
    index += 1;
  }

  return `Player ${index}`;
}

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  players: createDefaultPlayers(),
  addPlayer: () => {
    const players = get().players;

    if (players.length >= MAX_PLAYERS) {
      return;
    }

    const newPlayer: LobbyPlayer = {
      id: nanoid(),
      name: getNextPlayerName(players),
      isBot: false,
      botDifficulty: 'easy',
    };

    set({
      players: [...players, newPlayer],
    });
  },
  removePlayer: (id) => {
    const players = get().players;

    if (players.length <= MIN_PLAYERS) {
      return;
    }

    set({
      players: players.filter((player) => player.id !== id),
    });
  },
  updatePlayer: (id, updates) => {
    set((state) => ({
      players: state.players.map((player) => {
        if (player.id !== id) {
          return player;
        }

        const merged: LobbyPlayer = {
          ...player,
          ...updates,
        };

        return {
          ...merged,
          name: merged.name,
          botDifficulty: merged.botDifficulty ?? 'easy',
        };
      }),
    }));
  },
  toggleBot: (id) => {
    set((state) => ({
      players: state.players.map((player) => {
        if (player.id !== id) {
          return player;
        }

        return {
          ...player,
          isBot: !player.isBot,
        };
      }),
    }));
  },
  canStartGame: () => {
    const players = get().players;

    return (
      players.length >= MIN_PLAYERS &&
      players.length <= MAX_PLAYERS &&
      players.every((player) => player.name.trim().length > 0)
    );
  },
  getPlayerConfigs: () => {
    return get().players.map((player) => ({
      name: player.name.trim(),
      isBot: player.isBot,
      botDifficulty: player.isBot ? player.botDifficulty : undefined,
    }));
  },
  reset: () => {
    set({
      players: createDefaultPlayers(),
    });
  },
}));

export type { LobbyPlayer, LobbyStore };
