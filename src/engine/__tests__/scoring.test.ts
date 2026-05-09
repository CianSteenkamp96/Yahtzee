import { describe, expect, it } from 'vitest';

import {
  calculateCategoryScore,
  calculateGrandTotal,
  calculateLowerTotal,
  calculateUpperBonus,
  calculateUpperTotal,
  scoreChance,
  scoreFourOfAKind,
  scoreFullHouse,
  scoreLargeStraight,
  scoreOnes,
  scoreSixes,
  scoreSmallStraight,
  scoreThreeOfAKind,
  scoreTwos,
  scoreYahtzee,
} from '../scoring';
import type { DieValue, PlayerState } from '../types';

describe('scoring engine', () => {
  it('scores upper section categories correctly', () => {
    const dice: DieValue[] = [1, 2, 2, 6, 6];

    expect(scoreOnes(dice)).toBe(1);
    expect(scoreTwos(dice)).toBe(4);
    expect(scoreSixes(dice)).toBe(12);
  });

  it('scores three of a kind correctly', () => {
    expect(scoreThreeOfAKind([2, 2, 2, 3, 4])).toBe(13);
    expect(scoreThreeOfAKind([1, 2, 3, 4, 5])).toBe(0);
  });

  it('scores four of a kind correctly', () => {
    expect(scoreFourOfAKind([3, 3, 3, 3, 1])).toBe(13);
    expect(scoreFourOfAKind([3, 3, 3, 2, 1])).toBe(0);
  });

  it('scores full house correctly and excludes non-full-house yahtzee', () => {
    expect(scoreFullHouse([2, 2, 3, 3, 3])).toBe(25);
    expect(scoreFullHouse([1, 1, 1, 1, 1])).toBe(0);
    expect(scoreFullHouse([1, 2, 3, 4, 5])).toBe(0);
  });

  it('scores small straight correctly with deduped runs', () => {
    expect(scoreSmallStraight([1, 2, 3, 4, 6])).toBe(30);
    expect(scoreSmallStraight([2, 3, 4, 5, 1])).toBe(30);
    expect(scoreSmallStraight([1, 2, 5, 6, 4])).toBe(0);
    expect(scoreSmallStraight([3, 4, 5, 6, 2])).toBe(30);
    expect(scoreSmallStraight([1, 2, 2, 3, 4])).toBe(30);
  });

  it('scores large straight correctly', () => {
    expect(scoreLargeStraight([1, 2, 3, 4, 5])).toBe(40);
    expect(scoreLargeStraight([2, 3, 4, 5, 6])).toBe(40);
    expect(scoreLargeStraight([1, 2, 3, 4, 6])).toBe(0);
  });

  it('scores yahtzee correctly', () => {
    expect(scoreYahtzee([4, 4, 4, 4, 4])).toBe(50);
    expect(scoreYahtzee([4, 4, 4, 4, 3])).toBe(0);
  });

  it('scores chance as the sum of all dice', () => {
    expect(scoreChance([1, 3, 4, 5, 6])).toBe(19);
    expect(scoreChance([6, 6, 6, 6, 6])).toBe(30);
  });

  it('dispatches category scoring correctly', () => {
    const dice: DieValue[] = [2, 2, 2, 5, 6];

    expect(calculateCategoryScore('twos', dice)).toBe(6);
    expect(calculateCategoryScore('threeOfAKind', dice)).toBe(17);
    expect(calculateCategoryScore('chance', dice)).toBe(17);
  });

  it('calculates upper total and bonus with threshold boundaries', () => {
    const belowThreshold = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 17,
    };

    const atThreshold = {
      ...belowThreshold,
      sixes: 18,
    };

    expect(calculateUpperTotal(belowThreshold)).toBe(62);
    expect(calculateUpperBonus(belowThreshold)).toBe(0);

    expect(calculateUpperTotal(atThreshold)).toBe(63);
    expect(calculateUpperBonus(atThreshold)).toBe(35);
  });

  it('calculates lower total correctly', () => {
    const scores = {
      threeOfAKind: 23,
      fourOfAKind: 24,
      fullHouse: 25,
      smallStraight: 30,
      largeStraight: 40,
      yahtzee: 50,
      chance: 20,
    };

    expect(calculateLowerTotal(scores)).toBe(212);
  });

  it('calculates grand total including upper bonus and yahtzee bonus', () => {
    const player: PlayerState = {
      id: 'p1',
      name: 'Player 1',
      isBot: false,
      scores: {
        ones: 3,
        twos: 6,
        threes: 9,
        fours: 12,
        fives: 15,
        sixes: 18,
        threeOfAKind: 20,
        fourOfAKind: 24,
        fullHouse: 25,
        smallStraight: 30,
        largeStraight: 40,
        yahtzee: 50,
        chance: 20,
      },
      yahtzeeBonus: 2,
    };

    expect(calculateGrandTotal(player)).toBe(507);
  });
});
