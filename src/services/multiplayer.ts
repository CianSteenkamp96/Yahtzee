// Multiplayer service stub - will be replaced with WebSocket implementation later

import type { GameState, ScoreCategory } from '../engine/types';

export type RoomCode = string;

export interface GameAction {
  type: 'roll' | 'toggleHold' | 'scoreCategory';
  payload?: {
    dieIndex?: number;
    category?: ScoreCategory;
  };
}

export interface MultiplayerService {
  createRoom(hostPlayerName: string): Promise<RoomCode>;
  joinRoom(code: RoomCode, playerName: string): Promise<GameState>;
  sendAction(action: GameAction): void;
  onStateUpdate(callback: (state: GameState) => void): () => void; // returns unsubscribe
  onPlayerJoined(callback: (playerName: string) => void): () => void;
  onPlayerLeft(callback: (playerName: string) => void): () => void;
  disconnect(): void;
  isConnected(): boolean;
}

// Stub that throws - online mode not yet implemented
class StubMultiplayerService implements MultiplayerService {
  async createRoom(): Promise<RoomCode> {
    throw new Error('Online multiplayer not yet implemented');
  }

  async joinRoom(): Promise<GameState> {
    throw new Error('Online multiplayer not yet implemented');
  }

  sendAction(): void {
    throw new Error('Online multiplayer not yet implemented');
  }

  onStateUpdate(): () => void {
    return () => {};
  }

  onPlayerJoined(): () => void {
    return () => {};
  }

  onPlayerLeft(): () => void {
    return () => {};
  }

  disconnect(): void {}

  isConnected(): boolean {
    return false;
  }
}

export const multiplayerService: MultiplayerService = new StubMultiplayerService();
