import { describe, expect, it } from 'vitest';

import { decideBotAction, getEasyBotDecision, getHardBotDecision, getMediumBotDecision } from '../bot';
import { ALL_CATEGORIES } from '../constants';
import type { BotDifficulty, DieValue, GameState, PlayerState, ScoreCategory } from '../types';
import { getAvailableCategories, validateScoreSelection } from '../validation';

function createBotPlayer(
  difficulty: BotDifficulty,
  scores: Partial<Record<ScoreCategory, number>> = {},
): PlayerState {
  return {
    id: `bot-${difficulty}`,
    name: `bot-${difficulty}`,
    isBot: true,
    botDifficulty: difficulty,
    scores,
    yahtzeeBonus: 0,
  };
}

function createState(player: PlayerState, dice: DieValue[], rollsLeft: number): GameState {
  return {
    id: 'game',
    players: [player, { id: 'other', name: 'other', isBot: false, scores: {}, yahtzeeBonus: 0 }],
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

function createOneCategoryLeftPlayer(difficulty: BotDifficulty): PlayerState {
  const filled: Partial<Record<ScoreCategory, number>> = Object.fromEntries(
    ALL_CATEGORIES.filter((category) => category !== 'chance').map((category) => [category, 0]),
  );

  return createBotPlayer(difficulty, filled);
}

function assertScoreDecisionIsValid(state: GameState, category: ScoreCategory): void {
  expect(validateScoreSelection(state, category).valid).toBe(true);
}

describe('bot engine', () => {
  it('easy bot always returns valid moves', () => {
    const player = createBotPlayer('easy');

    const rollState = createState(player, [1, 2, 3, 4, 5], 3);
    const rollDecision = getEasyBotDecision(rollState, player);

    expect(rollDecision.action).toBe('roll');
    expect(rollDecision.holds).toHaveLength(5);

    const scoreState = createState(player, [6, 6, 6, 2, 3], 0);
    const scoreDecision = getEasyBotDecision(scoreState, player);

    expect(scoreDecision.action).toBe('score');
    expect(scoreDecision.category).toBeDefined();
    assertScoreDecisionIsValid(scoreState, scoreDecision.category as ScoreCategory);
  });

  it('medium bot picks highest immediate scoring category when rollsLeft is 0', () => {
    const player = createBotPlayer('medium');
    const state = createState(player, [5, 5, 5, 5, 5], 0);

    const decision = getMediumBotDecision(state, player);

    expect(decision.action).toBe('score');
    expect(decision.category).toBe('yahtzee');
  });

  it('hard bot makes valid decisions in both rolling and scoring states', () => {
    const player = createBotPlayer('hard');

    const rollingState = createState(player, [1, 2, 3, 4, 6], 2);
    const rollingDecision = getHardBotDecision(rollingState, player);

    expect(rollingDecision.action).toBe('roll');
    expect(rollingDecision.holds).toHaveLength(5);

    const scoringState = createState(player, [2, 2, 2, 4, 4], 0);
    const scoringDecision = getHardBotDecision(scoringState, player);

    expect(scoringDecision.action).toBe('score');
    assertScoreDecisionIsValid(scoringState, scoringDecision.category as ScoreCategory);
  });

  it('all bots handle edge case where only one category remains', () => {
    const difficulties: BotDifficulty[] = ['easy', 'medium', 'hard'];

    for (const difficulty of difficulties) {
      const player = createOneCategoryLeftPlayer(difficulty);
      const state = createState(player, [1, 2, 3, 4, 5], 0);
      const decision = decideBotAction(state);

      expect(decision.action).toBe('score');
      expect(decision.category).toBe('chance');
    }
  });

  it('bot never selects a filled category', () => {
    const player = createBotPlayer('hard', { yahtzee: 0, chance: 10 });
    const state = createState(player, [6, 6, 6, 6, 6], 0);
    const decision = decideBotAction(state);
    const available = getAvailableCategories(player, state.dice).map((entry) => entry.category);

    expect(decision.action).toBe('score');
    expect(available).toContain(decision.category as ScoreCategory);
    expect(decision.category).not.toBe('yahtzee');
    expect(decision.category).not.toBe('chance');
  });
});