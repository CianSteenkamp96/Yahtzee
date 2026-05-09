import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { MAX_PLAYERS, MIN_PLAYERS } from '../../engine/constants';
import type { BotDifficulty } from '../../engine/types';
import { useGameStore } from '../../store/gameStore';
import { useLobbyStore } from '../../store/lobbyStore';
import { Button } from '../shared/Button';
import styles from './LobbyScreen.module.css';

const BOT_DIFFICULTIES: BotDifficulty[] = ['easy', 'medium', 'hard'];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function LobbyScreen() {
  const navigate = useNavigate();

  const players = useLobbyStore((state) => state.players);
  const addPlayer = useLobbyStore((state) => state.addPlayer);
  const removePlayer = useLobbyStore((state) => state.removePlayer);
  const updatePlayer = useLobbyStore((state) => state.updatePlayer);
  const canStartGame = useLobbyStore((state) => state.canStartGame);
  const getPlayerConfigs = useLobbyStore((state) => state.getPlayerConfigs);
  const resetLobby = useLobbyStore((state) => state.reset);

  const startGame = useGameStore((state) => state.startGame);

  const isAtMinPlayers = players.length <= MIN_PLAYERS;
  const isAtMaxPlayers = players.length >= MAX_PLAYERS;
  const canStart = canStartGame();

  const presetButtons = useMemo(
    () => [
      {
        label: 'vs Bot',
        onClick: () => {
          resetLobby();
          const latest = useLobbyStore.getState().players;
          if (latest.length < 2) {
            return;
          }

          updatePlayer(latest[0].id, {
            name: 'You',
            isBot: false,
            botDifficulty: 'easy',
          });

          updatePlayer(latest[1].id, {
            name: 'Bot',
            isBot: true,
            botDifficulty: 'medium',
          });
        },
      },
      {
        label: '2 Players',
        onClick: () => {
          resetLobby();
        },
      },
      {
        label: '4 Players',
        onClick: () => {
          resetLobby();
          useLobbyStore.getState().addPlayer();
          useLobbyStore.getState().addPlayer();
        },
      },
    ],
    [resetLobby, updatePlayer],
  );

  return (
    <main className={styles.screen}>
      <section className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Setup Game</p>
          <h2 className={styles.title}>New Game</h2>
          <p className={styles.subtitle}>Configure players before the first roll.</p>
        </header>

        <div className={styles.presets}>
          {presetButtons.map((preset) => (
            <Button key={preset.label} variant="ghost" size="sm" onClick={preset.onClick}>
              {preset.label}
            </Button>
          ))}
        </div>

        <div className={styles.playersBlock}>
          {players.map((player, index) => (
            <article key={player.id} className={styles.playerRow}>
              <p className={styles.playerNumber}>P{index + 1}</p>

              <input
                value={player.name}
                onChange={(event) => {
                  updatePlayer(player.id, {
                    name: event.target.value,
                  });
                }}
                className={styles.nameInput}
                maxLength={20}
                placeholder={`Player ${index + 1}`}
                aria-label={`Player ${index + 1} name`}
              />

              <label className={styles.selectWrap}>
                <span className={styles.selectLabel}>Type</span>
                <select
                  className={styles.select}
                  value={player.isBot ? 'bot' : 'human'}
                  onChange={(event) => {
                    updatePlayer(player.id, {
                      isBot: event.target.value === 'bot',
                    });
                  }}
                  aria-label={`Player ${index + 1} type`}
                >
                  <option value="human">Human</option>
                  <option value="bot">Bot</option>
                </select>
              </label>

              {player.isBot ? (
                <label className={styles.selectWrap}>
                  <span className={styles.selectLabel}>Difficulty</span>
                  <select
                    className={styles.select}
                    value={player.botDifficulty}
                    onChange={(event) => {
                      updatePlayer(player.id, {
                        botDifficulty: event.target.value as BotDifficulty,
                      });
                    }}
                    aria-label={`Player ${index + 1} bot difficulty`}
                  >
                    {BOT_DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {capitalize(difficulty)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <Button
                variant="danger"
                size="sm"
                disabled={isAtMinPlayers}
                onClick={() => {
                  removePlayer(player.id);
                }}
              >
                Remove
              </Button>
            </article>
          ))}
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={addPlayer} disabled={isAtMaxPlayers}>
            Add Player ({players.length}/{MAX_PLAYERS})
          </Button>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canStart}
            onClick={() => {
              startGame(getPlayerConfigs());
              navigate('/game');
            }}
          >
            Start Game
          </Button>
        </div>
      </section>
    </main>
  );
}

export default LobbyScreen;
