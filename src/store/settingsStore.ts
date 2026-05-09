import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type BotSpeed = 'slow' | 'normal' | 'fast';

interface SettingsStore {
  animationsEnabled: boolean;
  botSpeed: BotSpeed;
  toggleAnimations: () => void;
  setBotSpeed: (speed: BotSpeed) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      animationsEnabled: true,
      botSpeed: 'normal',
      toggleAnimations: () =>
        set((state) => ({
          animationsEnabled: !state.animationsEnabled,
        })),
      setBotSpeed: (speed) =>
        set({
          botSpeed: speed,
        }),
    }),
    {
      name: 'yahtzee-settings',
    },
  ),
);

export type { BotSpeed, SettingsStore };
