import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { calculateGrandTotal } from '../../engine/scoring';
import type { ScoreCategory } from '../../engine/types';
import { useGame } from '../../hooks/useGame';
import { useScorePreview } from '../../hooks/useScorePreview';
import { useGameStore } from '../../store/gameStore';
import { GameLayout } from '../layout/GameLayout';
import { PlayerList } from '../players/PlayerList';
import { DiceTray } from '../dice/DiceTray';
import { RollButton } from './RollButton';
import { TurnInfo } from './TurnInfo';
import { ScoreboardTabs } from '../scorecard/ScoreboardTabs';
import { Scorecard } from '../scorecard/Scorecard';
import styles from './GameScreen.module.css';

export function GameScreen() {
  const navigate = useNavigate();
  const { gameState, currentPlayer, availableCategories, canScore, scoreCategory, isBotThinking } = useGame();
  const executeBotTurn = useGameStore((state) => state.executeBotTurn);

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!gameState) {
      return;
    }

    if (gameState.phase === 'finished') {
      navigate('/results', { replace: true });
    }
  }, [gameState, navigate]);

  useEffect(() => {
    if (!gameState) {
      return;
    }

    setActiveTab(gameState.currentPlayerIndex);
  }, [gameState?.currentPlayerIndex]);

  useEffect(() => {
    if (!gameState || !currentPlayer) {
      return;
    }

    if (gameState.phase === 'finished') {
      return;
    }

    if (currentPlayer.isBot && !isBotThinking) {
      void executeBotTurn();
    }
  }, [currentPlayer, executeBotTurn, gameState, isBotThinking]);

  const previewScores = useScorePreview(gameState?.dice ?? []);

  const grandTotals = useMemo(() => {
    if (!gameState) {
      return [];
    }

    return gameState.players.map((player) => calculateGrandTotal(player));
  }, [gameState]);

  if (!gameState || !currentPlayer) {
    return null;
  }

  const selectedPlayer = gameState.players[activeTab] ?? currentPlayer;
  const isCurrentPlayersCard = activeTab === gameState.currentPlayerIndex;
  const isHumanCurrentTurn = isCurrentPlayersCard && !currentPlayer.isBot;
  const canCurrentPlayerScore = isCurrentPlayersCard && canScore;

  const handleSelectCategory = (category: ScoreCategory) => {
    if (!isCurrentPlayersCard || currentPlayer.isBot) {
      return;
    }

    scoreCategory(category);
  };

  return (
    <GameLayout>
      <section className={styles.leftStack}>
        <TurnInfo />
        <PlayerList players={gameState.players} currentPlayerIndex={gameState.currentPlayerIndex} />

        <div className={styles.diceArea}>
          <DiceTray />
        </div>

        <RollButton />
      </section>

      <section className={styles.rightStack}>
        <ScoreboardTabs
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          grandTotals={grandTotals}
        />

        <Scorecard
          player={selectedPlayer}
          isCurrentPlayer={isHumanCurrentTurn}
          availableCategories={isCurrentPlayersCard ? availableCategories : []}
          previewScores={previewScores}
          onSelectCategory={handleSelectCategory}
          canScore={canCurrentPlayerScore}
        />
      </section>
    </GameLayout>
  );
}

export default GameScreen;
