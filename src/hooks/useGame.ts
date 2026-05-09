import { useMemo } from 'react';

import { MAX_ROLLS } from '../engine/constants';
import { useGameStore } from '../store/gameStore';

export function useGame() {
  const gameState = useGameStore((state) => state.gameState);
  const isRolling = useGameStore((state) => state.isRolling);
  const isBotThinking = useGameStore((state) => state.isBotThinking);
  const roll = useGameStore((state) => state.roll);
  const toggleHold = useGameStore((state) => state.toggleHold);
  const scoreCategory = useGameStore((state) => state.scoreCategory);
  const getAvailableCategories = useGameStore((state) => state.getAvailableCategories);

  const currentPlayer = useMemo(() => {
    if (!gameState) {
      return null;
    }

    return gameState.players[gameState.currentPlayerIndex] ?? null;
  }, [gameState]);

  const availableCategories = useMemo(() => {
    if (!gameState || !currentPlayer) {
      return [];
    }

    return getAvailableCategories();
  }, [currentPlayer, gameState, getAvailableCategories]);

  const canRoll =
    gameState?.phase === 'rolling' &&
    (gameState.rollsLeft ?? 0) > 0 &&
    !currentPlayer?.isBot &&
    !isRolling;

  const canScore =
    gameState?.phase === 'rolling' &&
    (gameState.rollsLeft ?? MAX_ROLLS) < MAX_ROLLS;

  const mustScore = (gameState?.rollsLeft ?? 1) === 0;

  return {
    gameState,
    currentPlayer,
    availableCategories,
    isRolling,
    isBotThinking,
    roll,
    toggleHold,
    scoreCategory,
    canRoll,
    canScore,
    mustScore,
  };
}
