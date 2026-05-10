import { type KeyboardEvent } from 'react';

import type { ScoreCategory } from '../../engine/types';
import styles from './ScoreRow.module.css';

export interface ScoreRowProps {
  category: ScoreCategory;
  label: string;
  description: string;
  score: number | undefined;
  previewScore?: number;
  isAvailable: boolean;
  isCurrentPlayer: boolean;
  onSelect: (category: ScoreCategory) => void;
  isJoker?: boolean;
}

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

export function ScoreRow({
  category,
  label,
  description,
  score,
  previewScore,
  isAvailable,
  isCurrentPlayer,
  onSelect,
  isJoker = false,
}: ScoreRowProps) {
  const isScored = score !== undefined;
  const isZeroScore = score === 0;
  const isInteractive = isAvailable && isCurrentPlayer;
  const showPreview = isInteractive && !isScored && previewScore !== undefined;

  const handleSelect = () => {
    if (isInteractive) {
      onSelect(category);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(category);
    }
  };

  return (
    <div
      className={joinClasses(
        styles.row,
        isScored && styles.scored,
        !isScored && isAvailable && styles.available,
        !isScored && !isAvailable && styles.notAvailable,
        isInteractive && styles.availableCurrent,
      )}
      role={isInteractive ? 'button' : 'row'}
      tabIndex={isInteractive ? 0 : -1}
      aria-disabled={!isInteractive}
      title={description}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.categoryCell}>
        <span className={styles.label}>{label}</span>
        {isJoker ? (
          <span className={styles.jokerBadge} aria-label="Joker scoring applies" title="Joker scoring applies">
            *
          </span>
        ) : null}
      </div>

      <div className={styles.valueCell}>
        {isScored ? (
          <span className={joinClasses(styles.value, isZeroScore && styles.zeroScore)}>{score}</span>
        ) : showPreview ? (
          <>
            <span className={styles.valuePlaceholder}>-</span>
            <span className={joinClasses(styles.value, styles.preview)}>{previewScore}</span>
          </>
        ) : (
          <span className={styles.valuePlaceholder}>-</span>
        )}
      </div>
    </div>
  );
}

export default ScoreRow;
