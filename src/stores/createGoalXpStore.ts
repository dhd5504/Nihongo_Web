import type { BoundStateCreator } from "~/hooks/useBoundStore";

export type GoalXp = 200 | 250 | 300 | 350 | 400;

export type GoalXpSlice = {
  goalXp: GoalXp;
  setGoalXp: (newGoalXp: GoalXp) => void;
};

export const createGoalXpSlice: BoundStateCreator<GoalXpSlice> = (set) => ({
  goalXp: 200,
  setGoalXp: (newGoalXp: GoalXp) => set({ goalXp: newGoalXp }),
});
