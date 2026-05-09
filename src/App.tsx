import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { GamePage } from './pages/GamePage';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/lobby"
          element={
            <>
              <Header />
              <LobbyScreen />
            </>
          }
        />
        <Route path="/game" element={<GamePage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </div>
  );
}

export default App;
