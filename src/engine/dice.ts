import { DICE_COUNT } from './constants';
import type { DieValue } from './types';

function validateDieCount(count: number): void {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Dice count must be a non-negative integer. Received: ${count}`);
  }
}

function randomDie(): DieValue {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure random generator not available: crypto.getRandomValues is required.');
  }

  const buffer = new Uint8Array(1);
  globalThis.crypto.getRandomValues(buffer);

  return ((buffer[0] % 6) + 1) as DieValue;
}

export function rollDice(count: number): DieValue[] {
  validateDieCount(count);

  const dice: DieValue[] = [];
  for (let index = 0; index < count; index += 1) {
    dice.push(randomDie());
  }

  return dice;
}

export function rollWithHolds(currentDice: DieValue[], heldDice: boolean[]): DieValue[] {
  if (currentDice.length !== heldDice.length) {
    throw new Error('Dice and hold arrays must have the same length.');
  }

  const rerolledDice = rollDice(currentDice.length);

  return currentDice.map((die, index) => (heldDice[index] ? die : rerolledDice[index]));
}

export function createEmptyDice(): DieValue[] {
  return Array.from({ length: DICE_COUNT }, () => 1);
}

export function createEmptyHolds(): boolean[] {
  return Array.from({ length: DICE_COUNT }, () => false);
}

export function toggleHold(holds: boolean[], index: number): boolean[] {
  if (index < 0 || index >= holds.length) {
    throw new RangeError(`Hold index out of range: ${index}`);
  }

  return holds.map((value, currentIndex) => (currentIndex === index ? !value : value));
}

export function getDiceFrequency(dice: DieValue[]): Map<DieValue, number> {
  const frequency = new Map<DieValue, number>();

  for (const die of dice) {
    frequency.set(die, (frequency.get(die) ?? 0) + 1);
  }

  return frequency;
}

export function sortDice(dice: DieValue[]): DieValue[] {
  return [...dice].sort((a, b) => a - b);
}
