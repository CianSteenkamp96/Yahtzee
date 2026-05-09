import { useMemo } from 'react';

import { ALL_CATEGORIES } from '../engine/constants';
import { calculateCategoryScore } from '../engine/scoring';
import type { DieValue, ScoreCategory } from '../engine/types';

export function useScorePreview(dice: DieValue[]) {
  return useMemo(() => {
    const preview = new Map<ScoreCategory, number>();

    for (const category of ALL_CATEGORIES) {
      preview.set(category, calculateCategoryScore(category, dice));
    }

    return preview;
  }, [dice]);
}
