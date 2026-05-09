export function formatPlayerName(name: string, isBot: boolean): string {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return isBot ? 'Bot' : 'Player';
  }

  if (isBot && !trimmed.toLowerCase().includes('bot')) {
    return `${trimmed} (Bot)`;
  }

  return trimmed;
}

export function formatScore(score: number | undefined): string {
  return score === undefined ? '-' : String(score);
}

export function getOrdinalSuffix(n: number): string {
  const absolute = Math.abs(n);
  const mod100 = absolute % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return `${n}th`;
  }

  const mod10 = absolute % 10;

  if (mod10 === 1) {
    return `${n}st`;
  }

  if (mod10 === 2) {
    return `${n}nd`;
  }

  if (mod10 === 3) {
    return `${n}rd`;
  }

  return `${n}th`;
}

export function formatRollsLeft(rollsLeft: number): string {
  const currentRoll = Math.max(1, 4 - rollsLeft);
  return `Roll ${currentRoll} of 3`;
}

export function formatRound(round: number, totalRounds: number): string {
  return `Round ${round} of ${totalRounds}`;
}
