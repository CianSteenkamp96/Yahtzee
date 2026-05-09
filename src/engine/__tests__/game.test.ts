import { describe, expect, it, vi } from 'vitest';

import { ALL_CATEGORIES, MAX_ROLLS } from '../constants';
import {
  createGame,
  getWinners,
  rollDice,
  scoreCategory,
  toggleHold,
} from '../game';
import type { GameState, PlayerConfig, PlayerState, ScoreCategory } from '../types';

function createCompleteScores(score = 0): Record<ScoreCategory, number> {
  return Object.fromEntries(ALL_CATEGORIES.map((category) => [category, score])) as Record<
    ScoreCategory,
    number
  >;
}

function createMockGame(players: PlayerState[]): GameState {
  return {
    id: 'g1',
    players,
    currentPlayerIndex: 0,
    dice: [1, 1, 1, 1, 1],
    heldDice: [false, false, false, false, false],
    rollsLeft: 0,
    round: 1,
    phase: 'rolling',
    turnHistory: [],
    mode: 'local',
  };
}

describe('game state machine', () => {
  it('createGame builds a valid initial state', () => {
    const configs: PlayerConfig[] = [
      { name: 'A', isBot: false },
      { name: 'B', isBot: true, botDifficulty: 'easy' },
    ];

    const game = createGame(configs, 'local');

    expect(game.players).toHaveLength(2);
    expect(game.currentPlayerIndex).toBe(0);
    expect(game.rollsLeft).toBe(MAX_ROLLS);
    expect(game.phase).toBe('rolling');
    expect(game.dice).toEqual([1, 1, 1, 1, 1]);
    expect(game.heldDice).toEqual([false, false, false, false, false]);
    expect(game.turnHistory).toEqual([]);
    expect(game.round).toBe(1);
  });

  it('rollDice decrements rolls and rerolls unheld dice', () => {
    const randomSpy = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      const target = array as Uint8Array;
      target[0] = 4;
      return array;
    });

    const initial = createGame([
      { name: 'A', isBot: false },
      { name: 'B', isBot: false },
    ]);

    const rolled = rollDice(initial);

    expect(rolled.rollsLeft).toBe(2);
    expect(rolled.dice).toEqual([5, 5, 5, 5, 5]);
    randomSpy.mockRestore();
  });

  it('rollDice throws when no rolls remain', () => {
    const game = {
      ...createGame([
        { name: 'A', isBot: false },
        { name: 'B', isBot: false },
      ]),
      rollsLeft: 0,
    };

    expect(() => rollDice(game)).toThrow(Error);
  });

  it('toggleHold works after first roll and fails before first roll', () => {
    const game = createGame([
      { name: 'A', isBot: false },
      { name: 'B', isBot: false },
    ]);

    expect(() => toggleHold(game, 0)).toThrow(Error);

    const afterRoll = {
      ...game,
      rollsLeft: 2,
    };

    const toggled = toggleHold(afterRoll, 3);
    expect(toggled.heldDice[3]).toBe(true);
  });

  it('scoreCategory records score and advances to next player', () => {
    const game = createGame([
      { name: 'A', isBot: false },
      { name: 'B', isBot: false },
    ]);

    const before = {
      ...game,
      currentPlayerIndex: 0,
      dice: [1, 1, 2, 3, 4] as const,
      rollsLeft: 0,
    };

    const after = scoreCategory(before, 'ones');

    expect(after.players[0].scores.ones).toBe(2);
    expect(after.currentPlayerIndex).toBe(1);
    expect(after.rollsLeft).toBe(3);
    expect(after.turnHistory).toHaveLength(1);
    expect(after.turnHistory[0].category).toBe('ones');
  });

  it('supports full flow create -> roll -> hold -> roll -> score -> next player', () => {
    const randomSpy = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      const target = array as Uint8Array;
      target[0] = 5;
      return array;
    });

    const game = createGame([
      { name: 'A', isBot: false },
      { name: 'B', isBot: false },
    ]);

    const afterFirstRoll = rollDice(game);
    const withHold = toggleHold(afterFirstRoll, 0);
    const afterSecondRoll = rollDice(withHold);
    const readyToScore = {
      ...afterSecondRoll,
      rollsLeft: 0,
    };
    const scored = scoreCategory(readyToScore, 'sixes');

    expect(scored.players[0].scores.sixes).toBeDefined();
    expect(scored.currentPlayerIndex).toBe(1);
    expect(scored.rollsLeft).toBe(3);

    randomSpy.mockRestore();
  });

  it('marks game as finished when all categories are filled after scoring', () => {
    const almostComplete = createCompleteScores(0);
    delete almostComplete.chance;

    const p1: PlayerState = {
      id: 'p1',
      name: 'p1',
      isBot: false,
      scores: almostComplete,
      yahtzeeBonus: 0,
    };

    const p2: PlayerState = {
      id: 'p2',
      name: 'p2',
      isBot: false,
      scores: createCompleteScores(0),
      yahtzeeBonus: 0,
    };

    const game = createMockGame([p1, p2]);
    const finished = scoreCategory(game, 'chance');

    expect(finished.phase).toBe('finished');
    expect(finished.rollsLeft).toBe(0);
  });

  it('getWinners returns top scorer(s) including ties', () => {
    const p1: PlayerState = {
      id: 'p1',
      name: 'p1',
      isBot: false,
      scores: createCompleteScores(5),
      yahtzeeBonus: 0,
    };
    const p2: PlayerState = {
      id: 'p2',
      name: 'p2',
      isBot: false,
      scores: createCompleteScores(7),
      yahtzeeBonus: 0,
    };
    const p3: PlayerState = {
      id: 'p3',
      name: 'p3',
      isBot: false,
      scores: createCompleteScores(7),
      yahtzeeBonus: 0,
    };

    const winners = getWinners(createMockGame([p1, p2, p3]));

    expect(winners.map((player) => player.id).sort()).toEqual(['p2', 'p3']);
  });
});