import { MAX_ROLLS, TOTAL_ROUNDS } from '../../engine/constants';
import { useGame } from '../../hooks/useGame';
import styles from './TurnInfo.module.css';

export function TurnInfo() {
  const { gameState, currentPlayer, isBotThinking } = useGame();

  if (!gameState || !currentPlayer) {
    return null;
  }

  const rollNumber = MAX_ROLLS - gameState.rollsLeft + 1;
  const boundedRollNumber = Math.min(MAX_ROLLS, Math.max(1, rollNumber));
  const infoText = `Player ${currentPlayer.name} | Round ${gameState.round} of ${TOTAL_ROUNDS} | Roll ${boundedRollNumber} of ${MAX_ROLLS}`;

  return (
    <section className={styles.turnInfo} aria-label="Current turn information">
      <p className={styles.metaText}>{infoText}</p>
      {isBotThinking ? <p className={styles.botThinking}>Bot is thinking...</p> : null}
    </section>
  );
}