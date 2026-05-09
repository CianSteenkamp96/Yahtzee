import { create } from 'zustand';

import { MAX_ROLLS } from '../engine/constants';
import { decideBotAction } from '../engine/bot';
import {
  createGame,
  getCurrentPlayer as getEngineCurrentPlayer,
  getWinners as getEngineWinners,
  rollDice as rollGameDice,
  scoreCategory as scoreGameCategory,
  toggleHold as toggleGameHold,
} from '../engine/game';
import type {
  GameState,
  PlayerConfig,
  PlayerState,
  ScoreCategory,
  ScoreResult,
} from '../engine/types';
import { getAvailableCategories as getValidationAvailableCategories } from '../engine/validation';
import { useSettingsStore } from './settingsStore';

interface GameActions {
  startGame: (playerConfigs: PlayerConfig[]) => void;
  resetGame: () => void;
  roll: () => void;
  toggleHold: (dieIndex: number) => void;
  scoreCategory: (category: ScoreCategory) => void;
  executeBotTurn: () => Promise<void>;
  getCurrentPlayer: () => PlayerState | null;
  getAvailableCategories: () => ScoreResult[];
  getWinners: () => PlayerState[];
  isCurrentPlayerBot: () => boolean;
}

interface GameStore extends GameActions {
  gameState: GameState | null;
  isRolling: boolean;
  isBotThinking: boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function randomDelay(minMs: number, maxMs: number): number {
  if (maxMs <= minMs) {
    return minMs;
  }

  if (!globalThis.crypto?.getRandomValues) {
    return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
  }

  const bytes = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bytes);
  const spread = maxMs - minMs + 1;

  return minMs + (bytes[0] % spread);
}

function getBotDelayRange(): { min: number; max: number } {
  const { botSpeed } = useSettingsStore.getState();

  if (botSpeed === 'slow') {
    return { min: 900, max: 1400 };
  }

  if (botSpeed === 'fast') {
    return { min: 300, max: 650 };
  }

  return { min: 500, max: 1000 };
}

function getRollAnimationDelay(): number {
  const { animationsEnabled } = useSettingsStore.getState();
  return animationsEnabled ? 600 : 0;
}

function applyDecisionHolds(state: GameState, desiredHolds: boolean[]): GameState {
  let nextState = state;

  for (let index = 0; index < nextState.heldDice.length; index += 1) {
    const shouldHold = desiredHolds[index] ?? false;

    if (nextState.heldDice[index] !== shouldHold) {
      nextState = toggleGameHold(nextState, index);
    }
  }

  return nextState;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  isRolling: false,
  isBotThinking: false,
  startGame: (playerConfigs) => {
    const gameState = createGame(playerConfigs);

    set({
      gameState,
      isRolling: false,
      isBotThinking: false,
    });
  },
  resetGame: () => {
    set({
      gameState: null,
      isRolling: false,
      isBotThinking: false,
    });
  },
  roll: () => {
    const state = get().gameState;

    if (!state || state.phase !== 'rolling' || state.rollsLeft <= 0) {
      return;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isBot) {
      return;
    }

    const nextState = rollGameDice(state);

    set({
      gameState: nextState,
      isRolling: true,
    });

    const animationDelay = getRollAnimationDelay();
    if (animationDelay > 0) {
      setTimeout(() => {
        set({ isRolling: false });
      }, animationDelay);
    } else {
      set({ isRolling: false });
    }
  },
  toggleHold: (dieIndex) => {
    const state = get().gameState;

    if (!state || state.phase !== 'rolling') {
      return;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isBot) {
      return;
    }

    const nextState = toggleGameHold(state, dieIndex);

    set({
      gameState: nextState,
    });
  },
  scoreCategory: (category) => {
    const state = get().gameState;

    if (!state || state.phase === 'finished') {
      return;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isBot) {
      return;
    }

    const nextState = scoreGameCategory(state, category);

    set({
      gameState: nextState,
      isRolling: false,
    });
  },
  executeBotTurn: async () => {
    const initialState = get().gameState;

    if (!initialState || initialState.phase === 'finished') {
      return;
    }

    const startingPlayer = initialState.players[initialState.currentPlayerIndex];
    if (!startingPlayer?.isBot) {
      return;
    }

    if (get().isBotThinking) {
      return;
    }

    set({ isBotThinking: true });

    let state = initialState;

    try {
      while (state.phase !== 'finished') {
        const playerIndex = state.currentPlayerIndex;
        const player = state.players[state.currentPlayerIndex];
        if (!player?.isBot) {
          break;
        }

        let turnStepCount = 0;

        while (state.phase === 'rolling' && state.currentPlayerIndex === playerIndex) {
          turnStepCount += 1;
          if (turnStepCount > 12) {
            break;
          }

          const decision = decideBotAction(state);
          const delayRange = getBotDelayRange();
          await sleep(randomDelay(delayRange.min, delayRange.max));

          if (decision.action === 'roll' && state.rollsLeft > 0) {
            let preparedState = state;

            if (decision.holds && state.rollsLeft < MAX_ROLLS) {
              preparedState = applyDecisionHolds(preparedState, decision.holds);
            }

            const rolledState = rollGameDice(preparedState);

            set({
              gameState: rolledState,
              isRolling: true,
            });

            const animationDelay = getRollAnimationDelay();
            if (animationDelay > 0) {
              await sleep(animationDelay);
            }

            state = rolledState;

            set({
              gameState: state,
              isRolling: false,
            });

            continue;
          }

          const scoringPlayer = state.players[state.currentPlayerIndex];
          if (!scoringPlayer) {
            break;
          }

          const available = getValidationAvailableCategories(scoringPlayer, state.dice);
          const category = decision.category ?? available[0]?.category;

          if (!category) {
            break;
          }

          state = scoreGameCategory(state, category);

          set({
            gameState: state,
            isRolling: false,
          });

          break;
        }

        // Stop if a bot turn did not progress to avoid a potential infinite loop.
        if (state.phase === 'rolling' && state.currentPlayerIndex === playerIndex) {
          break;
        }
      }
    } finally {
      set({
        gameState: state,
        isBotThinking: false,
        isRolling: false,
      });
    }
  },
  getCurrentPlayer: () => {
    const state = get().gameState;

    if (!state) {
      return null;
    }

    return getEngineCurrentPlayer(state);
  },
  getAvailableCategories: () => {
    const state = get().gameState;

    if (!state) {
      return [];
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) {
      return [];
    }

    return getValidationAvailableCategories(currentPlayer, state.dice);
  },
  getWinners: () => {
    const state = get().gameState;

    if (!state) {
      return [];
    }

    return getEngineWinners(state);
  },
  isCurrentPlayerBot: () => {
    const state = get().gameState;

    if (!state) {
      return false;
    }

    return Boolean(state.players[state.currentPlayerIndex]?.isBot);
  },
}));

export type { GameActions, GameStore };
