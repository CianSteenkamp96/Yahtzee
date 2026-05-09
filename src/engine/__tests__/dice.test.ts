import { describe, expect, it, vi } from 'vitest';

import {
  createEmptyDice,
  createEmptyHolds,
  getDiceFrequency,
  rollDice,
  rollWithHolds,
  sortDice,
  toggleHold,
} from '../dice';
import type { DieValue } from '../types';

describe('dice engine', () => {
  it('rollDice returns the requested number of dice with values between 1 and 6', () => {
    const dice = rollDice(100);

    expect(dice).toHaveLength(100);
    for (const die of dice) {
      expect(die).toBeGreaterThanOrEqual(1);
      expect(die).toBeLessThanOrEqual(6);
    }
  });

  it('rollDice supports rolling zero dice', () => {
    expect(rollDice(0)).toEqual([]);
  });

  it('rollDice throws for invalid counts', () => {
    expect(() => rollDice(-1)).toThrow(RangeError);
    expect(() => rollDice(1.5)).toThrow(RangeError);
  });

  it('rollWithHolds keeps held dice unchanged and rerolls unheld dice', () => {
    const randomSpy = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      const target = array as Uint8Array;
      target[0] = 5;
      return array;
    });

    const currentDice: DieValue[] = [1, 2, 3, 4, 5];
    const heldDice = [true, false, true, false, true];

    const result = rollWithHolds(currentDice, heldDice);

    expect(result[0]).toBe(1);
    expect(result[2]).toBe(3);
    expect(result[4]).toBe(5);

    expect(result[1]).toBe(6);
    expect(result[3]).toBe(6);

    randomSpy.mockRestore();
  });

  it('rollWithHolds throws when dice and hold lengths differ', () => {
    expect(() => rollWithHolds([1, 2, 3] as DieValue[], [true, false])).toThrow(Error);
  });

  it('createEmptyDice initializes five dice to 1', () => {
    expect(createEmptyDice()).toEqual([1, 1, 1, 1, 1]);
  });

  it('createEmptyHolds initializes five holds to false', () => {
    expect(createEmptyHolds()).toEqual([false, false, false, false, false]);
  });

  it('toggleHold toggles only the requested index and keeps original immutable', () => {
    const holds = [false, true, false, false, true];
    const result = toggleHold(holds, 2);

    expect(result).toEqual([false, true, true, false, true]);
    expect(holds).toEqual([false, true, false, false, true]);
  });

  it('toggleHold throws for out-of-range indices', () => {
    const holds = [false, false, false, false, false];

    expect(() => toggleHold(holds, -1)).toThrow(RangeError);
    expect(() => toggleHold(holds, 5)).toThrow(RangeError);
  });

  it('getDiceFrequency counts each die value correctly', () => {
    const frequency = getDiceFrequency([2, 2, 3, 6, 2]);

    expect(frequency.get(2)).toBe(3);
    expect(frequency.get(3)).toBe(1);
    expect(frequency.get(6)).toBe(1);
    expect(frequency.get(1)).toBeUndefined();
  });

  it('sortDice returns a sorted copy and does not mutate the original', () => {
    const dice: DieValue[] = [6, 1, 4, 2, 3];
    const sorted = sortDice(dice);

    expect(sorted).toEqual([1, 2, 3, 4, 6]);
    expect(dice).toEqual([6, 1, 4, 2, 3]);
  });
});
