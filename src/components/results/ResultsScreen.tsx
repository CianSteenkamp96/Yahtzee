import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  calculateGrandTotal,
  calculateLowerTotal,
  calculateUpperBonus,
  calculateUpperTotal,
} from '../../engine/scoring';
import { YAHTZEE_BONUS_SCORE } from '../../engine/constants';
import { useGameStore } from '../../store/gameStore';
import { useLobbyStore } from '../../store/lobbyStore';
import { Button } from '../shared/Button';
import styles from './ResultsScreen.module.css';

function ordinal(rank: number): string {
  if (rank % 100 >= 11 && rank % 100 <= 13) {
    return `${rank}th`;
  }

  const remainder = rank % 10;
  if (remainder === 1) {
    return `${rank}st`;
  }

  if (remainder === 2) {
    return `${rank}nd`;
  }

  if (remainder === 3) {
    return `${rank}rd`;
  }

  return `${rank}th`;
}

export function ResultsScreen() {
  const navigate = useNavigate();

  const gameState = useGameStore((state) => state.gameState);
  const resetGame = useGameStore((state) => state.resetGame);

  const ranked = useMemo(() => {
    if (!gameState) {
      return [];
    }

    return [...gameState.players]
      .map((player) => ({
        player,
        total: calculateGrandTotal(player),
        upperTotal: calculateUpperTotal(player.scores),
        upperBonus: calculateUpperBonus(player.scores),
        lowerTotal: calculateLowerTotal(player.scores),
        yahtzeeBonus: player.yahtzeeBonus * YAHTZEE_BONUS_SCORE,
      }))
      .sort((a, b) => b.total - a.total);
  }, [gameState]);

  if (!gameState || ranked.length === 0) {
    return null;
  }

  const winnerId = ranked[0].player.id;

  const setupLobbyFromCurrentGame = () => {
    const configs = gameState.players.map((player) => ({
      name: player.name,
      isBot: player.isBot,
      botDifficulty: player.botDifficulty ?? 'easy',
    }));

    const lobby = useLobbyStore.getState();
    lobby.reset();

    for (let index = 2; index < configs.length; index += 1) {
      useLobbyStore.getState().addPlayer();
    }

    const currentLobbyPlayers = useLobbyStore.getState().players;

    currentLobbyPlayers.forEach((lobbyPlayer, index) => {
      const config = configs[index];

      if (!config) {
        return;
      }

      useLobbyStore.getState().updatePlayer(lobbyPlayer.id, {
        name: config.name,
        isBot: config.isBot,
        botDifficulty: config.botDifficulty,
      });
    });
  };

  return (
    <main className={styles.screen}>
      <section className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Game Over!</h1>
          <p className={styles.subtitle}>Final standings and score breakdown</p>

          <div className={styles.confetti} aria-hidden="true">
            {Array.from({ length: 22 }).map((_, index) => (
              <motion.span
                key={index}
                className={styles.particle}
                style={{
                  left: `${(index / 22) * 100}%`,
                }}
                initial={{ y: -20, opacity: 0 }}
                animate={{
                  y: [0, 120],
                  opacity: [0, 1, 0],
                  rotate: [0, 240],
                }}
                transition={{
                  duration: 2 + (index % 5) * 0.2,
                  repeat: Infinity,
                  delay: index * 0.06,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </header>

        <div className={styles.ranking}>
          {ranked.map((entry, index) => {
            const isWinner = entry.player.id === winnerId;

            return (
              <article key={entry.player.id} className={`${styles.rankCard} ${isWinner ? styles.winner : ''}`}>
                <div className={styles.rankTop}>
                  <p className={styles.rankLabel}>{ordinal(index + 1)}</p>
                  <p className={styles.playerName}>
                    {isWinner ? '👑 ' : ''}
                    {entry.player.name}
                    {entry.player.isBot ? ' 🤖' : ''}
                  </p>
                  <p className={styles.total}>{entry.total}</p>
                </div>

                <p className={styles.breakdown}>
                  Upper {entry.upperTotal} + Bonus {entry.upperBonus} | Lower {entry.lowerTotal} | Yahtzee Bonus {entry.yahtzeeBonus}
                </p>
              </article>
            );
          })}
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => {
              setupLobbyFromCurrentGame();
              resetGame();
              navigate('/lobby');
            }}
          >
            Play Again
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              useLobbyStore.getState().reset();
              resetGame();
              navigate('/lobby');
            }}
          >
            New Game
          </Button>
        </div>
      </section>
    </main>
  );
}

export default ResultsScreen;
