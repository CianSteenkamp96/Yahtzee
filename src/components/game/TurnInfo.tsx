import { AnimatePresence, motion } from 'framer-motion';

import { MAX_ROLLS, TOTAL_ROUNDS } from '../../engine/constants';
import { useGame } from '../../hooks/useGame';
import styles from './TurnInfo.module.css';

const INDICATOR_COLORS = ['#ef4444', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2'];

export function TurnInfo() {
  const { gameState, currentPlayer, isBotThinking } = useGame();

  if (!gameState || !currentPlayer) {
    return null;
  }

  const playerColor = INDICATOR_COLORS[gameState.currentPlayerIndex % INDICATOR_COLORS.length];
  const rollsUsed = MAX_ROLLS - gameState.rollsLeft;

  return (
    <section className={styles.turnInfo} aria-label="Current turn information">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlayer.id}
          className={styles.playerRow}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <span className={styles.playerDot} style={{ backgroundColor: playerColor }} aria-hidden="true" />
          <div>
            <p className={styles.playerLabel}>Current Player</p>
            <p className={styles.playerName}>{currentPlayer.name}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.metaRow}>
        <p className={styles.metaText}>Round {gameState.round} of {TOTAL_ROUNDS}</p>
        <p className={styles.metaText}>
          Rolls Left: <span className={styles.rollsValue}>{gameState.rollsLeft}</span>
        </p>
        <p className={styles.metaText}>Rolls Used: {rollsUsed}</p>
      </div>

      {isBotThinking ? (
        <motion.p
          className={styles.botThinking}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          Bot is thinking...
        </motion.p>
      ) : null}
    </section>
  );
}