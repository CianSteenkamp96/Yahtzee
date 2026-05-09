import { rollDice, rollWithHolds } from '../engine/dice';

const ROOM_CODE_LENGTH = 6;
const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function cryptoRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError(`maxExclusive must be a positive integer. Received: ${maxExclusive}`);
  }

  if (!globalThis.crypto?.getRandomValues) {
    return Math.floor(Math.random() * maxExclusive);
  }

  const maxUint32 = 0x100000000;
  const threshold = maxUint32 - (maxUint32 % maxExclusive);
  const buffer = new Uint32Array(1);

  do {
    globalThis.crypto.getRandomValues(buffer);
  } while (buffer[0] >= threshold);

  return buffer[0] % maxExclusive;
}

// Re-export dice rolling helpers that already use crypto randomness.
export { rollDice, rollWithHolds };

export function generateRoomCode(): string {
  let code = '';

  for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
    const charIndex = cryptoRandomInt(ALPHANUMERIC.length);
    code += ALPHANUMERIC[charIndex];
  }

  return code;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = cryptoRandomInt(index + 1);
    const temp = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = temp;
  }

  return shuffled;
}
