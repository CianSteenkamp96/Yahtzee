import { LOWER_CATEGORIES, MAX_ROLLS, UPPER_TARGET_VALUES } from './constants';
import { getDiceFrequency } from './dice';
import { calculateCategoryScore, calculateUpperTotal } from './scoring';
import type { BotDecision, DieValue, GameState, PlayerState, ScoreCategory } from './types';
import { getAvailableCategories, isYahtzee } from './validation';

const UPPER_BONUS_TARGET_AVERAGE = 3;

function getCurrentBotPlayer(state: GameState): PlayerState {
  const player = state.players[state.currentPlayerIndex];
  if (!player) {
    throw new Error(`Invalid current player index: ${state.currentPlayerIndex}`);
  }

  return player;
}

function pickRandomCategory(categories: ScoreCategory[]): ScoreCategory {
  if (categories.length === 0) {
    throw new Error('No categories available for bot decision.');
  }

  if (!globalThis.crypto?.getRandomValues) {
    return categories[Math.floor(Math.random() * categories.length)];
  }

  const bytes = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bytes);
  return categories[bytes[0] % categories.length];
}

function getMostFrequentDie(dice: DieValue[]): DieValue {
  const frequency = getDiceFrequency(dice);
  let bestValue: DieValue = dice[0];
  let bestCount = -1;

  for (const [value, count] of frequency.entries()) {
    if (count > bestCount || (count === bestCount && value > bestValue)) {
      bestValue = value;
      bestCount = count;
    }
  }

  return bestValue;
}

function isUpperCategory(category: ScoreCategory): boolean {
  return category in UPPER_TARGET_VALUES;
}

function scoreWithPriority(player: PlayerState, category: ScoreCategory, score: number): number {
  if (!isUpperCategory(category)) {
    return score;
  }

  const targetValue = UPPER_TARGET_VALUES[category];
  const currentUpperTotal = calculateUpperTotal(player.scores);
  const expectedUpperTotal = currentUpperTotal + score;
  const averageNeeded = expectedUpperTotal / UPPER_BONUS_TARGET_AVERAGE;
  const bonusProgressWeight = expectedUpperTotal < 63 ? targetValue * 0.8 : 1;

  return score + bonusProgressWeight + averageNeeded * 0.1;
}

function estimateExpectedScore(dice: DieValue[], category: ScoreCategory, rollsLeft: number): number {
  const immediate = calculateCategoryScore(category, dice);

  if (rollsLeft <= 0) {
    return immediate;
  }

  const frequency = getDiceFrequency(dice);
  const maxCount = Math.max(...frequency.values());

  if (category === 'yahtzee') {
    return immediate + maxCount * 8 * rollsLeft;
  }

  if (category === 'largeStraight' || category === 'smallStraight') {
    const uniqueCount = new Set(dice).size;
    return immediate + uniqueCount * 4 * rollsLeft;
  }

  if (category === 'fullHouse') {
    const counts = [...frequency.values()].sort((a, b) => b - a);
    const pairPotential = (counts[0] ?? 0) + (counts[1] ?? 0);
    return immediate + pairPotential * 3 * rollsLeft;
  }

  if (isUpperCategory(category)) {
    const target = UPPER_TARGET_VALUES[category];
    const matching = dice.filter((die) => die === target).length;
    return immediate + matching * target * 1.8 * rollsLeft;
  }

  if (category === 'chance') {
    const highDice = dice.filter((die) => die >= 4).reduce((sum, die) => sum + die, 0);
    return immediate + highDice * 0.25 * rollsLeft;
  }

  return immediate + maxCount * 2 * rollsLeft;
}

function getBestScoringCategory(player: PlayerState, state: GameState): ScoreCategory {
  const available = getAvailableCategories(player, state.dice);
  if (available.length === 0) {
    throw new Error('No available categories for scoring.');
  }

  return [...available]
    .sort((a, b) => scoreWithPriority(player, b.category, b.score) - scoreWithPriority(player, a.category, a.score))[0]
    .category;
}

function getHardScoringCategory(player: PlayerState, state: GameState): ScoreCategory {
  const available = getAvailableCategories(player, state.dice);
  if (available.length === 0) {
    throw new Error('No available categories for scoring.');
  }

  const scarcityWeight = Math.max(1, 13 - Object.keys(player.scores).length);
  const prioritizeYahtzeeBonus = player.scores.yahtzee === 50 && isYahtzee(state.dice);

  const ranked = [...available].sort((a, b) => {
    const aExpected = estimateExpectedScore(state.dice, a.category, 0) + scoreWithPriority(player, a.category, a.score);
    const bExpected = estimateExpectedScore(state.dice, b.category, 0) + scoreWithPriority(player, b.category, b.score);

    const aScarcity = LOWER_CATEGORIES.includes(a.category as (typeof LOWER_CATEGORIES)[number]) ? scarcityWeight : 0;
    const bScarcity = LOWER_CATEGORIES.includes(b.category as (typeof LOWER_CATEGORIES)[number]) ? scarcityWeight : 0;

    const aBonus = prioritizeYahtzeeBonus && a.category === 'yahtzee' ? 1000 : 0;
    const bBonus = prioritizeYahtzeeBonus && b.category === 'yahtzee' ? 1000 : 0;

    return bExpected + bScarcity + bBonus - (aExpected + aScarcity + aBonus);
  });

  return ranked[0].category;
}

export function getBestHolds(dice: DieValue[], targetCategory: ScoreCategory): boolean[] {
  if (isUpperCategory(targetCategory)) {
    const target = UPPER_TARGET_VALUES[targetCategory];
    return dice.map((die) => die === target);
  }

  if (targetCategory === 'chance') {
    return dice.map((die) => die >= 4);
  }

  if (targetCategory === 'smallStraight' || targetCategory === 'largeStraight') {
    const straightCandidates: DieValue[][] =
      targetCategory === 'smallStraight'
        ? [
            [1, 2, 3, 4],
            [2, 3, 4, 5],
            [3, 4, 5, 6],
          ]
        : [
            [1, 2, 3, 4, 5],
            [2, 3, 4, 5, 6],
          ];

    let bestCandidate = straightCandidates[0];
    let bestHits = -1;

    for (const candidate of straightCandidates) {
      const hits = candidate.filter((value) => dice.includes(value)).length;
      if (hits > bestHits) {
        bestHits = hits;
        bestCandidate = candidate;
      }
    }

    const remaining = new Map<DieValue, number>();
    for (const value of bestCandidate) {
      remaining.set(value, (remaining.get(value) ?? 0) + 1);
    }

    return dice.map((die) => {
      const count = remaining.get(die) ?? 0;
      if (count > 0) {
        remaining.set(die, count - 1);
        return true;
      }

      return false;
    });
  }

  if (targetCategory === 'fullHouse') {
    const frequency = [...getDiceFrequency(dice).entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
    const primary = frequency[0]?.[0];
    const secondary = frequency[1]?.[0];
    return dice.map((die) => die === primary || die === secondary);
  }

  const mostFrequent = getMostFrequentDie(dice);
  return dice.map((die) => die === mostFrequent);
}

export function getEasyBotDecision(state: GameState, player: PlayerState): BotDecision {
  const available = getAvailableCategories(player, state.dice);

  if (state.rollsLeft > 0 && state.rollsLeft === MAX_ROLLS) {
    return {
      action: 'roll',
      holds: [false, false, false, false, false],
    };
  }

  if (state.rollsLeft > 0) {
    const frequentDie = getMostFrequentDie(state.dice);

    return {
      action: 'roll',
      holds: state.dice.map((die) => die === frequentDie),
    };
  }

  return {
    action: 'score',
    category: pickRandomCategory(available.map((result) => result.category)),
  };
}

export function getMediumBotDecision(state: GameState, player: PlayerState): BotDecision {
  const available = getAvailableCategories(player, state.dice);

  if (state.rollsLeft > 0) {
    const bestCategory = [...available]
      .sort((a, b) => estimateExpectedScore(state.dice, b.category, state.rollsLeft) - estimateExpectedScore(state.dice, a.category, state.rollsLeft))[0]
      .category;

    return {
      action: 'roll',
      holds: getBestHolds(state.dice, bestCategory),
    };
  }

  const bestCategory = [...available].sort((a, b) => b.score - a.score)[0].category;

  return {
    action: 'score',
    category: bestCategory,
  };
}

export function getHardBotDecision(state: GameState, player: PlayerState): BotDecision {
  const available = getAvailableCategories(player, state.dice);
  const availableCategories = available.map((result) => result.category);

  if (availableCategories.length === 1) {
    if (state.rollsLeft > 0) {
      return {
        action: 'roll',
        holds: getBestHolds(state.dice, availableCategories[0]),
      };
    }

    return {
      action: 'score',
      category: availableCategories[0],
    };
  }

  if (state.rollsLeft > 0) {
    const bestCategory = [...available]
      .sort(
        (a, b) =>
          estimateExpectedScore(state.dice, b.category, state.rollsLeft) -
          estimateExpectedScore(state.dice, a.category, state.rollsLeft),
      )[0]
      .category;

    return {
      action: 'roll',
      holds: getBestHolds(state.dice, bestCategory),
    };
  }

  return {
    action: 'score',
    category: getHardScoringCategory(player, state),
  };
}

export function decideBotAction(state: GameState): BotDecision {
  const player = getCurrentBotPlayer(state);
  const difficulty = player.botDifficulty ?? 'easy';

  if (difficulty === 'medium') {
    return getMediumBotDecision(state, player);
  }

  if (difficulty === 'hard') {
    return getHardBotDecision(state, player);
  }

  return getEasyBotDecision(state, player);
}