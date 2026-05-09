import { useMemo } from 'react';
import { motion } from 'framer-motion';

import type { DieValue } from '../../engine/types';
import styles from './Die.module.css';

type PipPosition = 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br';

interface DieProps {
  value: DieValue;
  isHeld: boolean;
  canHold: boolean;
  onToggleHold: () => void;
  isRolling: boolean;
  index: number;
}

const FACE_MAP: Record<DieValue, PipPosition[]> = {
  1: ['cc'],
  2: ['tr', 'bl'],
  3: ['tr', 'cc', 'bl'],
  4: ['tl', 'tr', 'bl', 'br'],
  5: ['tl', 'tr', 'cc', 'bl', 'br'],
  6: ['tl', 'cl', 'bl', 'tr', 'cr', 'br'],
};

function className(parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Die({ value, isHeld, canHold, onToggleHold, isRolling, index }: DieProps) {
  const rollingAnimation = useMemo(() => {
    const base = (value * 47 + (index + 1) * 31) % 360;
    const firstSwing = base % 2 === 0 ? 220 : -220;
    const secondSwing = firstSwing * -0.55;

    return {
      rotate: isRolling ? [0, firstSwing, secondSwing, 0] : 0,
      scale: isRolling ? [1, 0.9, 1.06, 1] : 1,
    };
  }, [index, isRolling, value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!canHold) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggleHold();
    }
  };

  const ariaLabel = `Die ${index + 1}: value ${value}, ${isHeld ? 'held' : 'not held'}`;

  return (
    <motion.button
      type="button"
      role="button"
      aria-label={ariaLabel}
      aria-disabled={!canHold}
      disabled={!canHold}
      tabIndex={canHold ? 0 : -1}
      className={className([styles.die, isHeld && styles.held, !canHold && styles.locked])}
      onClick={() => {
        if (canHold) {
          onToggleHold();
        }
      }}
      onKeyDown={handleKeyDown}
      animate={{
        ...rollingAnimation,
        y: isHeld ? -8 : 0,
      }}
      transition={{
        duration: isRolling ? 0.6 : 0.24,
        ease: 'easeInOut',
        delay: isRolling ? index * 0.08 : 0,
      }}
      whileTap={canHold ? { scale: 0.96 } : undefined}
    >
      <span className={styles.face} aria-hidden="true">
        {FACE_MAP[value].map((position) => (
          <span key={position} className={className([styles.pip, styles[position]])} />
        ))}
      </span>
    </motion.button>
  );
}

export type { DieProps };