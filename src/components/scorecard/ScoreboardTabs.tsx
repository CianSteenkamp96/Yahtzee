import { useEffect, useRef } from 'react';

import type { PlayerState } from '../../engine/types';
import styles from './ScoreboardTabs.module.css';

export interface ScoreboardTabsProps {
  players: PlayerState[];
  currentPlayerIndex: number;
  activeTab: number;
  onTabChange: (playerIndex: number) => void;
  grandTotals: number[];
}

export function ScoreboardTabs({
  players,
  currentPlayerIndex,
  activeTab,
  onTabChange,
  grandTotals,
}: ScoreboardTabsProps) {
  const previousCurrentPlayerRef = useRef(currentPlayerIndex);

  useEffect(() => {
    if (previousCurrentPlayerRef.current !== currentPlayerIndex && activeTab !== currentPlayerIndex) {
      onTabChange(currentPlayerIndex);
    }

    previousCurrentPlayerRef.current = currentPlayerIndex;
  }, [activeTab, currentPlayerIndex, onTabChange]);

  return (
    <nav className={styles.tabBar} aria-label="Scoreboard player tabs">
      <div className={styles.tabScroller} role="tablist" aria-orientation="horizontal">
        {players.map((player, index) => {
          const isActive = index === activeTab;
          const isCurrentPlayer = index === currentPlayerIndex;
          const score = grandTotals[index] ?? 0;

          return (
            <button
              key={player.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${player.name}, score ${score}${isCurrentPlayer ? ', currently playing' : ''}`}
              className={`${styles.tab} ${isActive ? styles.active : ''} ${
                isCurrentPlayer ? styles.currentPlayer : ''
              }`}
              onClick={() => onTabChange(index)}
            >
              <span className={styles.tabTopRow}>
                <span className={styles.nameWrap}>
                  {player.isBot ? <span className={styles.botBadge}>🤖</span> : null}
                  <span className={styles.playerName}>{player.name}</span>
                </span>
                {isCurrentPlayer ? <span className={styles.playingDot} aria-hidden="true" /> : null}
              </span>
              <span className={styles.score}>{score}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default ScoreboardTabs;
