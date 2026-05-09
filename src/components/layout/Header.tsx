import { useNavigate } from 'react-router-dom';

import { Button } from '../shared/Button';
import styles from './Header.module.css';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.titleButton}
          onClick={() => {
            navigate('/');
          }}
          aria-label="Go to main menu"
        >
          <span className={styles.die} aria-hidden="true">
            ⚀
          </span>
          <h1 className={styles.title}>Yahtzee</h1>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigate('/');
          }}
        >
          Menu
        </Button>
      </div>
    </header>
  );
}

export default Header;
