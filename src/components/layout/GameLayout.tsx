import { Children } from 'react';
import type { ReactNode } from 'react';

import styles from './GameLayout.module.css';

export interface GameLayoutProps {
  children: ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  const parts = Children.toArray(children);
  const leftPanel = parts[0] ?? null;
  const rightPanel = parts[1] ?? null;
  const extra = parts.slice(2);

  return (
    <main className={styles.layout}>
      <div className={styles.container}>
        <section className={styles.leftPanel}>{leftPanel}{extra}</section>
        <aside className={styles.rightPanel}>{rightPanel}</aside>
      </div>
    </main>
  );
}

export default GameLayout;
