import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <main className={styles.screen}>
      <section className={styles.hero}>
        <div className={styles.decor} aria-hidden="true">
          <span className={styles.dieA}>⚄</span>
          <span className={styles.dieB}>⚅</span>
          <span className={styles.dieC}>⚁</span>
        </div>

        <p className={styles.subtitle}>The Classic Dice Game</p>
        <h1 className={styles.title}>YAHTZEE</h1>

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              navigate('/lobby');
            }}
          >
            New Game
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => {
              setRulesOpen(true);
            }}
          >
            How to Play
          </Button>
        </div>
      </section>

      <Modal
        isOpen={rulesOpen}
        onClose={() => {
          setRulesOpen(false);
        }}
        title="How to Play"
      >
        <div className={styles.rules}>
          <p>Roll up to three times each turn and choose one category to score.</p>
          <p>Each category can be used only once, so choose carefully.</p>
          <p>Reach 63 in the upper section for a 35-point bonus.</p>
          <p>Highest grand total after 13 rounds wins.</p>
        </div>
      </Modal>
    </main>
  );
}

export default HomePage;
