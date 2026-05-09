import { Navigate } from 'react-router-dom';

import { GameScreen } from '../components/game/GameScreen';
import { useGameStore } from '../store/gameStore';

export function GamePage() {
  const gameState = useGameStore((state) => state.gameState);

  if (!gameState) {
    return <Navigate to="/" replace />;
  }

  if (gameState.phase === 'finished') {
    return <Navigate to="/results" replace />;
  }

  return <GameScreen />;
}

export default GamePage;
