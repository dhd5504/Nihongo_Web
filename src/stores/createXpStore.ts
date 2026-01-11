import dayjs from "dayjs";
import type { BoundStateCreator } from "~/hooks/useBoundStore";
import type { DateString } from "~/utils/dateString";
import { toDateString } from "~/utils/dateString";
import { range, sum } from "~/utils/array-utils";

const addXpToday = (xpByDate: XpByDate, xp: number): XpByDate => {
  return addXp(xpByDate, xp, dayjs());
};

const addXp = (xpByDate: XpByDate, xp: number, date: dayjs.Dayjs): XpByDate => {
  return {
    ...xpByDate,
    [toDateString(date)]: xpAt(xpByDate, date) + xp,
  };
};

const xpAt = (xpByDate: XpByDate, date: dayjs.Dayjs): number => {
  return xpByDate[toDateString(date)] ?? 0;
};

type XpByDate = Record<DateString, number>;

export type XpSlice = {
  xpByDate: XpByDate;
  goalRewardClaimedDates: DateString[];
  increaseXp: (by: number) => void;
  xpToday: () => number;
  xpThisWeek: () => number;
};

export const createXpSlice: BoundStateCreator<XpSlice> = (set, get) => ({
  xpByDate: {},
  goalRewardClaimedDates: [],
  increaseXp: (by: number) => {
    const today = toDateString(dayjs());
    const newXpByDate = addXpToday(get().xpByDate, by);
    const goalXp = (get() as any).goalXp || 200;
    const xpToday = newXpByDate[today] ?? 0;

    set({ xpByDate: newXpByDate });

    // Extend streak on any XP gain
    if ((get() as any).addToday) {
      (get() as any).addToday();
    }

    // Reward for reaching daily goal
    const claimedDates = get().goalRewardClaimedDates;
    if (xpToday >= goalXp && !claimedDates.includes(today)) {
      if ((get() as any).increaseLingots) {
        (get() as any).increaseLingots(10); // Reward 10 gems for reaching goal
      }
      set((state) => ({
        goalRewardClaimedDates: [...state.goalRewardClaimedDates, today],
      }));
    }
  },
  xpToday: () => xpAt(get().xpByDate, dayjs()),
  xpThisWeek: () => {
    return sum(
      range(0, dayjs().day() + 1).map((daysBack) =>
        xpAt(get().xpByDate, dayjs().add(-daysBack)),
      ),
    );
  },
});
