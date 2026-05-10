import { MAX_ROLLS } from '../../engine/constants';
import { useDiceSound } from '../../hooks/useDiceSound';
import { useGame } from '../../hooks/useGame';
import { Button } from '../shared/Button';
import styles from './RollButton.module.css';

export function RollButton() {
  const { gameState, currentPlayer, isRolling, canRoll, roll } = useGame();
  const { playRollSound } = useDiceSound();

  if (!gameState || !currentPlayer) {
    return null;
  }

  const rollsLeft = gameState.rollsLeft;
  const isBotTurn = currentPlayer.isBot;
  const disabled = !canRoll || isBotTurn || isRolling;

  let label = 'Roll Dice';

  if (rollsLeft === 0) {
    label = 'Select a Category';
  } else if (rollsLeft < MAX_ROLLS) {
    label = `Roll Again (${rollsLeft} left)`;
  }

  const shouldPulse = !disabled && !isBotTurn && rollsLeft === MAX_ROLLS;

  const handleRoll = () => {
    playRollSound();
    roll();
  };

  return (
    <div className={styles.wrapper}>
      <div className={shouldPulse ? styles.pulse : undefined}>
        <Button
          variant="primary"
          size="lg"
          disabled={disabled}
          className={styles.rollButton}
          onClick={handleRoll}
        >
          {label}
        </Button>
      </div>
    </div>
  );
}