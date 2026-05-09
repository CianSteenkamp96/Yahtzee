import {
  ALL_CATEGORIES,
  FULL_HOUSE_SCORE,
  LARGE_STRAIGHT_SCORE,
  LOWER_CATEGORIES,
  SMALL_STRAIGHT_SCORE,
  UPPER_CATEGORIES,
  UPPER_TARGET_VALUES,
  YAHTZEE_SCORE,
} from './constants';
import { calculateCategoryScore, scoreUpperCategory } from './scoring';
import type { DieValue, GameState, PlayerState, ScoreCategory, ScoreResult, UpperCategory } from './types';

const JOKER_FORCED_CATEGORIES: ScoreCategory[] = ['fullHouse', 'smallStraight', 'largeStraight'];

function getUpperCategoryForValue(value: DieValue): UpperCategory {
  return UPPER_CATEGORIES.find((category) => UPPER_TARGET_VALUES[category] === value) as UpperCategory;
}

function isJokerState(player: PlayerState, dice: DieValue[]): boolean {
  return isYahtzee(dice) && player.scores.yahtzee === YAHTZEE_SCORE;
}

function getJokerLowerCategoryScore(category: ScoreCategory, dice: DieValue[]): number {
  if (category === 'fullHouse') {
    return FULL_HOUSE_SCORE;
  }

  if (category === 'smallStraight') {
    return SMALL_STRAIGHT_SCORE;
  }

  if (category === 'largeStraight') {
    return LARGE_STRAIGHT_SCORE;
  }

  return calculateCategoryScore(category, dice);
}

export function isYahtzee(dice: DieValue[]): boolean {
  if (dice.length === 0) {
    return false;
  }

  return dice.every((die) => die === dice[0]);
}

export function getYahtzeeValue(dice: DieValue[]): DieValue | null {
  return isYahtzee(dice) ? dice[0] : null;
}

export function isCategoryFilled(player: PlayerState, category: ScoreCategory): boolean {
  return player.scores[category] !== undefined;
}

export function getFilledCategories(player: PlayerState): ScoreCategory[] {
  return ALL_CATEGORIES.filter((category) => isCategoryFilled(player, category));
}

export function getUnfilledCategories(player: PlayerState): ScoreCategory[] {
  return ALL_CATEGORIES.filter((category) => !isCategoryFilled(player, category));
}

export function shouldAwardYahtzeeBonus(player: PlayerState, dice: DieValue[]): boolean {
  return isYahtzee(dice) && player.scores.yahtzee === YAHTZEE_SCORE;
}

export function getAvailableCategories(player: PlayerState, dice: DieValue[]): ScoreResult[] {
  const unfilledCategories = getUnfilledCategories(player);

  if (!isJokerState(player, dice)) {
    return unfilledCategories.map((category) => ({
      category,
      score: calculateCategoryScore(category, dice),
      available: true,
    }));
  }

  const yahtzeeValue = getYahtzeeValue(dice);
  if (yahtzeeValue === null) {
    return unfilledCategories.map((category) => ({
      category,
      score: calculateCategoryScore(category, dice),
      available: true,
    }));
  }

  const correspondingUpper = getUpperCategoryForValue(yahtzeeValue);

  if (!isCategoryFilled(player, correspondingUpper)) {
    return [
      {
        category: correspondingUpper,
        score: scoreUpperCategory(correspondingUpper, dice),
        available: true,
        isJoker: true,
      },
    ];
  }

  const unfilledLower = LOWER_CATEGORIES.filter((category) => !isCategoryFilled(player, category));
  if (unfilledLower.length > 0) {
    return unfilledLower.map((category) => ({
      category,
      score: getJokerLowerCategoryScore(category, dice),
      available: true,
      isJoker: JOKER_FORCED_CATEGORIES.includes(category),
    }));
  }

  const unfilledUpper = UPPER_CATEGORIES.filter((category) => !isCategoryFilled(player, category));

  return unfilledUpper.map((category) => ({
    category,
    score: 0,
    available: true,
    isJoker: true,
  }));
}

export function validateScoreSelection(
  state: GameState,
  category: ScoreCategory,
): { valid: boolean; reason?: string } {
  if (state.phase === 'finished') {
    return { valid: false, reason: 'Game is already finished.' };
  }

  if (state.phase !== 'rolling' && state.phase !== 'scoring') {
    return { valid: false, reason: `Cannot score during phase: ${state.phase}.` };
  }

  const player = state.players[state.currentPlayerIndex];
  if (!player) {
    return { valid: false, reason: 'Current player does not exist.' };
  }

  if (state.rollsLeft === 3) {
    return { valid: false, reason: 'Player must roll at least once before scoring.' };
  }

  if (isCategoryFilled(player, category)) {
    return { valid: false, reason: `Category ${category} has already been scored.` };
  }

  const available = getAvailableCategories(player, state.dice);
  const isAvailable = available.some((result) => result.category === category && result.available);

  if (!isAvailable) {
    return { valid: false, reason: `Category ${category} is not available for this roll.` };
  }

  return { valid: true };
}

export function isGameComplete(state: GameState): boolean {
  return state.players.every((player) => getFilledCategories(player).length === ALL_CATEGORIES.length);
}