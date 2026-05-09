import type { DieValue, LowerCategory, ScoreCategory, UpperCategory } from './types';

export const DICE_COUNT = 5;
export const MAX_ROLLS = 3;
export const TOTAL_ROUNDS = 13;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const UPPER_BONUS_THRESHOLD = 63;
export const UPPER_BONUS_POINTS = 35;

export const YAHTZEE_SCORE = 50;
export const YAHTZEE_BONUS_SCORE = 100;
export const FULL_HOUSE_SCORE = 25;
export const SMALL_STRAIGHT_SCORE = 30;
export const LARGE_STRAIGHT_SCORE = 40;

export const UPPER_CATEGORIES: UpperCategory[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];

export const LOWER_CATEGORIES: LowerCategory[] = [
  'threeOfAKind',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yahtzee',
  'chance',
];

export const ALL_CATEGORIES: ScoreCategory[] = [...UPPER_CATEGORIES, ...LOWER_CATEGORIES];

export const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  ones: 'Ones',
  twos: 'Twos',
  threes: 'Threes',
  fours: 'Fours',
  fives: 'Fives',
  sixes: 'Sixes',
  threeOfAKind: 'Three of a Kind',
  fourOfAKind: 'Four of a Kind',
  fullHouse: 'Full House',
  smallStraight: 'Small Straight',
  largeStraight: 'Large Straight',
  yahtzee: 'Yahtzee',
  chance: 'Chance',
};

export const CATEGORY_DESCRIPTIONS: Record<ScoreCategory, string> = {
  ones: 'Sum of all dice showing 1.',
  twos: 'Sum of all dice showing 2.',
  threes: 'Sum of all dice showing 3.',
  fours: 'Sum of all dice showing 4.',
  fives: 'Sum of all dice showing 5.',
  sixes: 'Sum of all dice showing 6.',
  threeOfAKind: 'At least 3 of the same value. Score is the sum of all 5 dice.',
  fourOfAKind: 'At least 4 of the same value. Score is the sum of all 5 dice.',
  fullHouse: 'A 3-of-a-kind plus a pair. Scores 25 points.',
  smallStraight: 'Any sequence of 4 consecutive values. Scores 30 points.',
  largeStraight: 'A sequence of 5 consecutive values. Scores 40 points.',
  yahtzee: 'All 5 dice the same. Scores 50 points.',
  chance: 'Any dice combination. Score is the sum of all 5 dice.',
};

export const UPPER_TARGET_VALUES: Record<UpperCategory, DieValue> = {
  ones: 1,
  twos: 2,
  threes: 3,
  fours: 4,
  fives: 5,
  sixes: 6,
};
