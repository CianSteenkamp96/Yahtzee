import { useMemo } from 'react';

import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  LOWER_CATEGORIES,
  UPPER_BONUS_POINTS,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
  YAHTZEE_BONUS_SCORE,
} from '../../engine/constants';
import {
  calculateGrandTotal,
  calculateLowerTotal,
  calculateUpperBonus,
  calculateUpperTotal,
} from '../../engine/scoring';
import type { PlayerState, ScoreCategory, ScoreResult } from '../../engine/types';
import { ScoreRow } from './ScoreRow';
import styles from './Scorecard.module.css';

export interface ScorecardProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  availableCategories: ScoreResult[];
  previewScores: Map<ScoreCategory, number>;
  onSelectCategory: (category: ScoreCategory) => void;
  canScore: boolean;
}

function formatProgress(current: number, target: number): string {
  return `${current}/${target}`;
}

interface StaticRowProps {
  label: string;
  value: number | string;
  emphasized?: boolean;
}

function StaticRow({ label, value, emphasized = false }: StaticRowProps) {
  return (
    <div className={`${styles.staticRow} ${emphasized ? styles.staticRowEmphasized : ''}`}>
      <span className={styles.staticLabel}>{label}</span>
      <span className={styles.staticValue}>{value}</span>
    </div>
  );
}

export function Scorecard({
  player,
  isCurrentPlayer,
  availableCategories,
  previewScores,
  onSelectCategory,
  canScore,
}: ScorecardProps) {
  const availableByCategory = useMemo(() => {
    const result = new Map<ScoreCategory, ScoreResult>();

    for (const scoreResult of availableCategories) {
      result.set(scoreResult.category, scoreResult);
    }

    return result;
  }, [availableCategories]);

  const upperTotal = calculateUpperTotal(player.scores);
  const upperBonus = calculateUpperBonus(player.scores);
  const lowerTotal = calculateLowerTotal(player.scores);
  const yahtzeeBonus = player.yahtzeeBonus * YAHTZEE_BONUS_SCORE;
  const grandTotal = calculateGrandTotal(player);
  const upperProgressPercent = Math.min(100, Math.round((upperTotal / UPPER_BONUS_THRESHOLD) * 100));

  const renderCategoryRow = (category: ScoreCategory) => {
    const rowAvailability = availableByCategory.get(category);
    const scoredValue = player.scores[category];

    return (
      <ScoreRow
        key={category}
        category={category}
        label={CATEGORY_LABELS[category]}
        description={CATEGORY_DESCRIPTIONS[category]}
        score={scoredValue}
        previewScore={
          canScore ? (rowAvailability?.score ?? previewScores.get(category)) : undefined
        }
        isAvailable={Boolean(canScore && rowAvailability?.available)}
        isCurrentPlayer={isCurrentPlayer}
        onSelect={onSelectCategory}
        isJoker={Boolean(rowAvailability?.isJoker)}
      />
    );
  };

  return (
    <section className={styles.card} aria-label={`${player.name} scorecard`}>
      <div className={styles.columns} aria-label={`${player.name} Yahtzee scorecard`}>
        <section className={styles.column}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.sectionTitle}>Upper Section</h3>
              <span className={styles.progressText}>{formatProgress(upperTotal, UPPER_BONUS_THRESHOLD)}</span>
            </div>
            <div className={styles.progressTrack} aria-hidden="true">
              <span className={styles.progressFill} style={{ width: `${upperProgressPercent}%` }} />
            </div>
          </div>

          <div className={styles.categoryRows}>
            {UPPER_CATEGORIES.map((category) => renderCategoryRow(category))}
            <div className={styles.spacerRow} />
          </div>

          <div className={styles.summaryRows}>
            <StaticRow label="Upper Total" value={upperTotal} />
            <StaticRow
              label={`Bonus (>=${UPPER_BONUS_THRESHOLD})`}
              value={upperBonus > 0 ? UPPER_BONUS_POINTS : 0}
            />
            <StaticRow label="" value="" />
          </div>
        </section>

        <section className={styles.column}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.sectionTitle}>Lower Section</h3>
            </div>
          </div>

          <div className={styles.categoryRows}>
            {LOWER_CATEGORIES.map((category) => renderCategoryRow(category))}
          </div>

          <div className={styles.summaryRows}>
            <StaticRow label="Lower Total" value={lowerTotal} />
            <StaticRow label="Yahtzee Bonus" value={yahtzeeBonus} />
            <StaticRow label="Grand Total" value={grandTotal} emphasized />
          </div>
        </section>
      </div>
    </section>
  );
}

export default Scorecard;
