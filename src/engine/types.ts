export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export type ScoreCategory =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'threeOfAKind'
  | 'fourOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yahtzee'
  | 'chance';

export type UpperCategory = 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes';
export type LowerCategory = Exclude<ScoreCategory, UpperCategory>;

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export type GamePhase = 'lobby' | 'rolling' | 'scoring' | 'finished';

export type GameMode = 'local' | 'online';

export interface PlayerConfig {
  name: string;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
}

export interface PlayerState {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  scores: Partial<Record<ScoreCategory, number>>;
  yahtzeeBonus: number;
}

export interface GameState {
  id: string;
  players: PlayerState[];
  currentPlayerIndex: number;
  dice: DieValue[];
  heldDice: boolean[];
  rollsLeft: number;
  round: number;
  phase: GamePhase;
  turnHistory: TurnRecord[];
  mode: GameMode;
}

export interface TurnRecord {
  playerId: string;
  category: ScoreCategory;
  score: number;
  dice: DieValue[];
}

export interface ScoreResult {
  category: ScoreCategory;
  score: number;
  available: boolean;
  isJoker?: boolean;
}

export interface BotDecision {
  action: 'roll' | 'score';
  holds?: boolean[];
  category?: ScoreCategory;
}
