import type { BoundStateCreator } from "~/hooks/useBoundStore";

export type LingotSlice = {
  lingots: number;
  streakFreezes: number;
  hasDoubleOrNothing: boolean;
  increaseLingots: (by: number) => void;
  buyStreakFreeze: () => void;
  buyDoubleOrNothing: () => void;
};

export const createLingotSlice: BoundStateCreator<LingotSlice> = (set) => ({
  lingots: 0,
  streakFreezes: 0,
  hasDoubleOrNothing: false,
  increaseLingots: (by: number) =>
    set(({ lingots }) => ({ lingots: lingots + by })),
  buyStreakFreeze: () =>
    set(({ lingots, streakFreezes }) => ({
      lingots: lingots - 10,
      streakFreezes: streakFreezes + 1,
    })),
  buyDoubleOrNothing: () =>
    set(({ lingots }) => ({
      lingots: lingots - 5,
      hasDoubleOrNothing: true,
    })),
});
