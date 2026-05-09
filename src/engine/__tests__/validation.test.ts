import { describe, expect, it } from 'vitest';

import { ALL_CATEGORIES, LOWER_CATEGORIES, UPPER_CATEGORIES } from '../constants';
import type { DieValue, GameState, PlayerState, ScoreCategory } from '../types';
import {
  getAvailableCategories,
  isGameComplete,
  isYahtzee,
  shouldAwardYahtzeeBonus,
  validateScoreSelection,
} from '../validation';

function createPlayer(name: string, scores: Partial<Record<ScoreCategory, number>> = {}): PlayerState {
  return {
    id: name,
    name,
    isBot: false,
    scores,
    yahtzeeBonus: 0,
  };
}

function createState(players: PlayerState[], dice: DieValue[], rollsLeft = 0): GameState {
  return {
    id: 'game-1',
    players,
    currentPlayerIndex: 0,
    dice,
    heldDice: [false, false, false, false, false],
    rollsLeft,
    round: 1,
    phase: 'rolling',
    turnHistory: [],
    mode: 'local',
  };
}

describe('validation engine', () => {
  it('isYahtzee detects yahtzee and non-yahtzee rolls', () => {
    expect(isYahtzee([6, 6, 6, 6, 6])).toBe(true);
    expect(isYahtzee([6, 6, 6, 6, 5])).toBe(false);
  });

  it('getAvailableCategories returns all unfilled categories for normal rolls', () => {
    const player = createPlayer('p1');
    const available = getAvailableCategories(player, [1, 2, 3, 4, 6]);

    expect(available).toHaveLength(ALL_CATEGORIES.length);
    expect(available.every((result) => result.available)).toBe(true);
  });

  it('applies forced joker rule to corresponding upper box and awards bonus when yahtzee scored as 50', () => {
    const player = createPlayer('p1', { yahtzee: 50 });
    const dice: DieValue[] = [4, 4, 4, 4, 4];

    const available = getAvailableCategories(player, dice);

    expect(shouldAwardYahtzeeBonus(player, dice)).toBe(true);
    expect(available).toEqual([
      {
        category: 'fours',
        score: 20,
        available: true,
        isJoker: true,
      },
    ]);
  });

  it('does not award bonus or joker behavior when yahtzee box was zero', () => {
    const player = createPlayer('p1', { yahtzee: 0 });
    const dice: DieValue[] = [2, 2, 2, 2, 2];

    const available = getAvailableCategories(player, dice);

    expect(shouldAwardYahtzeeBonus(player, dice)).toBe(false);
    expect(available).toHaveLength(ALL_CATEGORIES.length - 1);
    expect(available.every((entry) => !entry.isJoker)).toBe(true);
    expect(available.find((entry) => entry.category === 'twos')?.score).toBe(10);
  });

  it('allows any unfilled lower category with joker scoring when corresponding upper is already filled', () => {
    const player = createPlayer('p1', {
      yahtzee: 50,
      threes: 9,
    });

    const available = getAvailableCategories(player, [3, 3, 3, 3, 3]);
    const availableCategories = available.map((entry) => entry.category);

    expect(availableCategories.sort()).toEqual(
      LOWER_CATEGORIES.filter((category) => category !== 'yahtzee').sort(),
    );
    expect(available.find((entry) => entry.category === 'fullHouse')?.score).toBe(25);
    expect(available.find((entry) => entry.category === 'smallStraight')?.score).toBe(30);
    expect(available.find((entry) => entry.category === 'largeStraight')?.score).toBe(40);
  });

  it('forces any unfilled upper category at zero when corresponding upper and all lower are filled', () => {
    const filledLower: Partial<Record<ScoreCategory, number>> = {
      threeOfAKind: 20,
      fourOfAKind: 24,
      fullHouse: 25,
      smallStraight: 30,
      largeStraight: 40,
      yahtzee: 50,
      chance: 18,
    };

    const player = createPlayer('p1', {
      ...filledLower,
      sixes: 18,
    });

    const available = getAvailableCategories(player, [6, 6, 6, 6, 6]);

    expect(available.map((entry) => entry.category).sort()).toEqual(
      UPPER_CATEGORIES.filter((category) => category !== 'sixes').sort(),
    );
    expect(available.every((entry) => entry.score === 0)).toBe(true);
  });

  it('validateScoreSelection catches invalid state and category choices', () => {
    const player = createPlayer('p1', { ones: 3 });
    const other = createPlayer('p2');
    const state = createState([player, other], [1, 1, 2, 3, 4], 0);

    const finishedState: GameState = {
      ...state,
      phase: 'finished',
    };

    expect(validateScoreSelection(finishedState, 'twos').valid).toBe(false);
    expect(validateScoreSelection({ ...state, rollsLeft: 3 }, 'twos').valid).toBe(false);
    expect(validateScoreSelection(state, 'ones').valid).toBe(false);
  });

  it('isGameComplete detects when all players have all categories filled', () => {
    const completeScores = Object.fromEntries(ALL_CATEGORIES.map((category) => [category, 0])) as Record<
      ScoreCategory,
      number
    >;

    const completeState = createState(
      [createPlayer('p1', completeScores), createPlayer('p2', completeScores)],
      [1, 1, 1, 1, 1],
      0,
    );

    const incompleteState = createState([createPlayer('p1', { ones: 3 }), createPlayer('p2', completeScores)], [1, 1, 1, 1, 1], 0);

    expect(isGameComplete(completeState)).toBe(true);
    expect(isGameComplete(incompleteState)).toBe(false);
  });

  it('shouldAwardYahtzeeBonus only returns true for extra yahtzee when original yahtzee was 50', () => {
    const bonusPlayer = createPlayer('bonus', { yahtzee: 50 });
    const zeroPlayer = createPlayer('zero', { yahtzee: 0 });
    const emptyPlayer = createPlayer('empty');

    expect(shouldAwardYahtzeeBonus(bonusPlayer, [5, 5, 5, 5, 5])).toBe(true);
    expect(shouldAwardYahtzeeBonus(zeroPlayer, [5, 5, 5, 5, 5])).toBe(false);
    expect(shouldAwardYahtzeeBonus(emptyPlayer, [5, 5, 5, 5, 5])).toBe(false);
    expect(shouldAwardYahtzeeBonus(bonusPlayer, [5, 5, 5, 5, 4])).toBe(false);
  });
});