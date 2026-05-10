import type { ReactNode } from 'react';

import styles from './GameLayout.module.css';

export interface GameLayoutProps {
  children: ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  return <main className={styles.layout}>{children}</main>;
}

export default GameLayout;
