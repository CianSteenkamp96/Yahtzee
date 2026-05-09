import { useEffect } from 'react';

import { MAX_ROLLS } from '../../engine/constants';
import { useDiceAnimation } from '../../hooks/useDiceAnimation';
import { useGame } from '../../hooks/useGame';
import { Die } from './Die';
import styles from './DiceTray.module.css';

export function DiceTray() {
  const { gameState, currentPlayer, isRolling, isBotThinking, toggleHold } = useGame();
  const { isAnimating, triggerRoll } = useDiceAnimation();

  useEffect(() => {
    if (isRolling) {
      triggerRoll();
    }
  }, [isRolling, triggerRoll]);

  if (!gameState || gameState.dice.length === 0) {
    return null;
  }

  const canHold =
    gameState.phase === 'rolling' &&
    !currentPlayer?.isBot &&
    !isBotThinking &&
    !isRolling &&
    gameState.rollsLeft < MAX_ROLLS;

  return (
    <section className={styles.tray} aria-label="Dice tray">
      {gameState.dice.map((value, index) => {
        const held = gameState.heldDice[index] ?? false;

        return (
          <div key={`${index}-${value}`} className={styles.slot}>
            <span className={styles.heldLabel} aria-hidden={!held}>
              {held ? 'HELD' : ' '}
            </span>
            <Die
              value={value}
              isHeld={held}
              canHold={canHold}
              onToggleHold={() => {
                toggleHold(index);
              }}
              isRolling={isAnimating}
              index={index}
            />
          </div>
        );
      })}
    </section>
  );
}