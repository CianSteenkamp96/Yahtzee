import { Navigate } from 'react-router-dom';

import { ResultsScreen } from '../components/results/ResultsScreen';
import { useGameStore } from '../store/gameStore';

export function ResultsPage() {
  const gameState = useGameStore((state) => state.gameState);

  if (!gameState) {
    return <Navigate to="/" replace />;
  }

  return <ResultsScreen />;
}

export default ResultsPage;
