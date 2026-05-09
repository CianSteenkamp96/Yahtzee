import type { BotDifficulty } from '../../engine/types';
import styles from './PlayerBadge.module.css';

export interface PlayerBadgeProps {
  name: string;
  isBot: boolean;
  isCurrentTurn: boolean;
  score: number;
  botDifficulty?: BotDifficulty;
}

function formatDifficultyLabel(botDifficulty?: BotDifficulty): string {
  if (!botDifficulty) {
    return '';
  }

  return botDifficulty.charAt(0).toUpperCase() + botDifficulty.slice(1);
}

export function PlayerBadge({
  name,
  isBot,
  isCurrentTurn,
  score,
  botDifficulty,
}: PlayerBadgeProps) {
  return (
    <article
      className={`${styles.badge} ${isCurrentTurn ? styles.current : ''}`}
      aria-label={`${name}, total score ${score}${isCurrentTurn ? ', current turn' : ''}`}
    >
      <div className={styles.headerRow}>
        <p className={styles.name} title={name}>
          {name}
        </p>
        {isCurrentTurn ? <span className={styles.turnDot} aria-hidden="true" /> : null}
      </div>

      <div className={styles.metaRow}>
        <span className={styles.score}>{score}</span>
        {isBot ? (
          <span className={styles.bot} title={`Bot ${formatDifficultyLabel(botDifficulty)}`}>
            <span aria-hidden="true">🤖</span>
            {botDifficulty ? <span className={styles.botDifficulty}>{formatDifficultyLabel(botDifficulty)}</span> : null}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default PlayerBadge;
