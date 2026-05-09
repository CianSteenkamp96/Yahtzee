import {
  FULL_HOUSE_SCORE,
  LARGE_STRAIGHT_SCORE,
  LOWER_CATEGORIES,
  SMALL_STRAIGHT_SCORE,
  UPPER_BONUS_POINTS,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
  UPPER_TARGET_VALUES,
  YAHTZEE_BONUS_SCORE,
  YAHTZEE_SCORE,
} from './constants';
import { getDiceFrequency, sortDice } from './dice';
import type { DieValue, PlayerState, ScoreCategory, UpperCategory } from './types';

function sumDice(dice: DieValue[]): number {
  return dice.reduce((total, die) => total + die, 0);
}

function hasAtLeastNOfAKind(dice: DieValue[], target: number): boolean {
  return Array.from(getDiceFrequency(dice).values()).some((count) => count >= target);
}

export function scoreUpper(dice: DieValue[], target: DieValue): number {
  return dice.filter((die) => die === target).reduce((total, die) => total + die, 0);
}

export function scoreOnes(dice: DieValue[]): number {
  return scoreUpper(dice, 1);
}

export function scoreTwos(dice: DieValue[]): number {
  return scoreUpper(dice, 2);
}

export function scoreThrees(dice: DieValue[]): number {
  return scoreUpper(dice, 3);
}

export function scoreFours(dice: DieValue[]): number {
  return scoreUpper(dice, 4);
}

export function scoreFives(dice: DieValue[]): number {
  return scoreUpper(dice, 5);
}

export function scoreSixes(dice: DieValue[]): number {
  return scoreUpper(dice, 6);
}

export function scoreThreeOfAKind(dice: DieValue[]): number {
  return hasAtLeastNOfAKind(dice, 3) ? sumDice(dice) : 0;
}

export function scoreFourOfAKind(dice: DieValue[]): number {
  return hasAtLeastNOfAKind(dice, 4) ? sumDice(dice) : 0;
}

export function scoreFullHouse(dice: DieValue[]): number {
  const counts = Array.from(getDiceFrequency(dice).values()).sort((a, b) => a - b);
  return counts.length === 2 && counts[0] === 2 && counts[1] === 3 ? FULL_HOUSE_SCORE : 0;
}

export function scoreSmallStraight(dice: DieValue[]): number {
  const uniqueSorted = Array.from(new Set(sortDice(dice)));

  for (let index = 0; index <= uniqueSorted.length - 4; index += 1) {
    const first = uniqueSorted[index];
    if (
      uniqueSorted[index + 1] === first + 1 &&
      uniqueSorted[index + 2] === first + 2 &&
      uniqueSorted[index + 3] === first + 3
    ) {
      return SMALL_STRAIGHT_SCORE;
    }
  }

  return 0;
}

export function scoreLargeStraight(dice: DieValue[]): number {
  const uniqueSorted = Array.from(new Set(sortDice(dice)));
  if (uniqueSorted.length !== 5) {
    return 0;
  }

  const isOneToFive = uniqueSorted.every((value, index) => value === index + 1);
  const isTwoToSix = uniqueSorted.every((value, index) => value === index + 2);

  return isOneToFive || isTwoToSix ? LARGE_STRAIGHT_SCORE : 0;
}

export function scoreYahtzee(dice: DieValue[]): number {
  return getDiceFrequency(dice).size === 1 ? YAHTZEE_SCORE : 0;
}

export function scoreChance(dice: DieValue[]): number {
  return sumDice(dice);
}

export function calculateCategoryScore(category: ScoreCategory, dice: DieValue[]): number {
  switch (category) {
    case 'ones':
      return scoreOnes(dice);
    case 'twos':
      return scoreTwos(dice);
    case 'threes':
      return scoreThrees(dice);
    case 'fours':
      return scoreFours(dice);
    case 'fives':
      return scoreFives(dice);
    case 'sixes':
      return scoreSixes(dice);
    case 'threeOfAKind':
      return scoreThreeOfAKind(dice);
    case 'fourOfAKind':
      return scoreFourOfAKind(dice);
    case 'fullHouse':
      return scoreFullHouse(dice);
    case 'smallStraight':
      return scoreSmallStraight(dice);
    case 'largeStraight':
      return scoreLargeStraight(dice);
    case 'yahtzee':
      return scoreYahtzee(dice);
    case 'chance':
      return scoreChance(dice);
    default: {
      const unreachableCategory: never = category;
      throw new Error(`Unhandled score category: ${String(unreachableCategory)}`);
    }
  }
}

export function calculateUpperTotal(scores: Partial<Record<ScoreCategory, number>>): number {
  return UPPER_CATEGORIES.reduce((total, category) => total + (scores[category] ?? 0), 0);
}

export function calculateUpperBonus(scores: Partial<Record<ScoreCategory, number>>): number {
  return calculateUpperTotal(scores) >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_POINTS : 0;
}

export function calculateLowerTotal(scores: Partial<Record<ScoreCategory, number>>): number {
  return LOWER_CATEGORIES.reduce((total, category) => total + (scores[category] ?? 0), 0);
}

export function calculateGrandTotal(player: PlayerState): number {
  const upperTotal = calculateUpperTotal(player.scores);
  const lowerTotal = calculateLowerTotal(player.scores);
  const upperBonus = calculateUpperBonus(player.scores);

  return upperTotal + lowerTotal + upperBonus + player.yahtzeeBonus * YAHTZEE_BONUS_SCORE;
}

export function scoreUpperCategory(category: UpperCategory, dice: DieValue[]): number {
  return scoreUpper(dice, UPPER_TARGET_VALUES[category]);
}
