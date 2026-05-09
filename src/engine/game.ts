import { nanoid } from 'nanoid';

import { MAX_PLAYERS, MAX_ROLLS, MIN_PLAYERS, TOTAL_ROUNDS } from './constants';
import { createEmptyDice, createEmptyHolds, rollWithHolds, toggleHold as toggleHoldAtIndex } from './dice';
import { calculateGrandTotal } from './scoring';
import type {
  GameMode,
  GameState,
  PlayerConfig,
  PlayerState,
  ScoreCategory,
  TurnRecord,
} from './types';
import {
  getAvailableCategories,
  isGameComplete,
  shouldAwardYahtzeeBonus,
  validateScoreSelection,
} from './validation';

function randomIndex(maxExclusive: number): number {
  if (!globalThis.crypto?.getRandomValues) {
    return Math.floor(Math.random() * maxExclusive);
  }

  const bytes = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bytes);
  return bytes[0] % maxExclusive;
}

function shufflePlayers(players: PlayerState[]): PlayerState[] {
  const shuffled = [...players];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    const temp = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = temp;
  }

  return shuffled;
}

export function createPlayer(config: PlayerConfig): PlayerState {
  return {
    id: nanoid(),
    name: config.name,
    isBot: config.isBot,
    botDifficulty: config.botDifficulty,
    scores: {},
    yahtzeeBonus: 0,
  };
}

export function createGame(playerConfigs: PlayerConfig[], mode: GameMode = 'local'): GameState {
  if (playerConfigs.length < MIN_PLAYERS || playerConfigs.length > MAX_PLAYERS) {
    throw new Error(`Player count must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}.`);
  }

  const players = shufflePlayers(playerConfigs.map(createPlayer));

  return {
    id: nanoid(),
    players,
    currentPlayerIndex: 0,
    dice: createEmptyDice(),
    heldDice: createEmptyHolds(),
    rollsLeft: MAX_ROLLS,
    round: 1,
    phase: 'rolling',
    turnHistory: [],
    mode,
  };
}

export function getCurrentPlayer(state: GameState): PlayerState {
  const player = state.players[state.currentPlayerIndex];
  if (!player) {
    throw new Error(`Invalid current player index: ${state.currentPlayerIndex}`);
  }

  return player;
}

export function getNextPlayerIndex(state: GameState): number {
  return (state.currentPlayerIndex + 1) % state.players.length;
}

export function advanceTurn(state: GameState): GameState {
  const nextPlayerIndex = getNextPlayerIndex(state);
  const wrapped = nextPlayerIndex === 0;

  return {
    ...state,
    currentPlayerIndex: nextPlayerIndex,
    round: wrapped ? state.round + 1 : state.round,
  };
}

export function rollDice(state: GameState): GameState {
  if (state.phase !== 'rolling') {
    throw new Error(`Cannot roll dice during phase: ${state.phase}.`);
  }

  if (state.rollsLeft <= 0) {
    throw new Error('No rolls remaining for this turn.');
  }

  const isFirstRoll = state.rollsLeft === MAX_ROLLS;
  const holds = isFirstRoll ? createEmptyHolds() : state.heldDice;
  const dice = rollWithHolds(state.dice, holds);

  return {
    ...state,
    dice,
    heldDice: holds,
    rollsLeft: state.rollsLeft - 1,
    phase: 'rolling',
  };
}

export function toggleHold(state: GameState, dieIndex: number): GameState {
  if (state.phase !== 'rolling') {
    throw new Error(`Cannot hold dice during phase: ${state.phase}.`);
  }

  if (state.rollsLeft === MAX_ROLLS) {
    throw new Error('Cannot hold dice before the first roll.');
  }

  if (dieIndex < 0 || dieIndex >= state.heldDice.length) {
    throw new RangeError(`Die index out of range: ${dieIndex}`);
  }

  return {
    ...state,
    heldDice: toggleHoldAtIndex(state.heldDice, dieIndex),
  };
}

export function scoreCategory(state: GameState, category: ScoreCategory): GameState {
  const validation = validateScoreSelection(state, category);
  if (!validation.valid) {
    throw new Error(validation.reason ?? 'Invalid score selection.');
  }

  const currentPlayer = getCurrentPlayer(state);
  const availableCategories = getAvailableCategories(currentPlayer, state.dice);
  const selectedScore = availableCategories.find((result) => result.category === category);

  if (!selectedScore) {
    throw new Error(`No score available for category: ${category}`);
  }

  const bonusIncrement = shouldAwardYahtzeeBonus(currentPlayer, state.dice) ? 1 : 0;
  const updatedPlayer: PlayerState = {
    ...currentPlayer,
    scores: {
      ...currentPlayer.scores,
      [category]: selectedScore.score,
    },
    yahtzeeBonus: currentPlayer.yahtzeeBonus + bonusIncrement,
  };

  const updatedPlayers = state.players.map((player, index) =>
    index === state.currentPlayerIndex ? updatedPlayer : player,
  );

  const turnRecord: TurnRecord = {
    playerId: currentPlayer.id,
    category,
    score: selectedScore.score,
    dice: [...state.dice],
  };

  const scoredState: GameState = {
    ...state,
    players: updatedPlayers,
    turnHistory: [...state.turnHistory, turnRecord],
  };

  if (isGameComplete(scoredState)) {
    return {
      ...scoredState,
      phase: 'finished',
      rollsLeft: 0,
    };
  }

  const nextTurnState = advanceTurn(scoredState);

  return {
    ...nextTurnState,
    dice: createEmptyDice(),
    heldDice: createEmptyHolds(),
    rollsLeft: MAX_ROLLS,
    phase: 'rolling',
  };
}

export function getWinners(state: GameState): PlayerState[] {
  if (state.players.length === 0) {
    return [];
  }

  const totals = state.players.map((player) => ({
    player,
    total: calculateGrandTotal(player),
  }));
  const highestScore = Math.max(...totals.map((entry) => entry.total));

  return totals.filter((entry) => entry.total === highestScore).map((entry) => entry.player);
}

export function isPlayerTurnComplete(state: GameState): boolean {
  return state.rollsLeft < MAX_ROLLS;
}