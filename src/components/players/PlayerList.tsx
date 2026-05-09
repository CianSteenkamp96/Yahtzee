import { calculateGrandTotal } from '../../engine/scoring';
import type { PlayerState } from '../../engine/types';
import { PlayerBadge } from './PlayerBadge';
import styles from './PlayerList.module.css';

export interface PlayerListProps {
  players: PlayerState[];
  currentPlayerIndex: number;
}

export function PlayerList({ players, currentPlayerIndex }: PlayerListProps) {
  return (
    <section className={styles.wrapper} aria-label="Players in game">
      {players.map((player, index) => (
        <PlayerBadge
          key={player.id}
          name={player.name}
          isBot={player.isBot}
          isCurrentTurn={index === currentPlayerIndex}
          score={calculateGrandTotal(player)}
          botDifficulty={player.botDifficulty}
        />
      ))}
    </section>
  );
}

export default PlayerList;
