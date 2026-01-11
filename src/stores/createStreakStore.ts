import dayjs from "dayjs";
import type { BoundStateCreator } from "~/hooks/useBoundStore";
import type { DateString } from "~/utils/dateString";
import { toDateString } from "~/utils/dateString";

type ActiveDays = DateString[];

const addActiveDay = (activeDays: ActiveDays, day: dayjs.Dayjs): ActiveDays => {
  const dateStr = toDateString(day);
  if (activeDays.includes(dateStr)) return activeDays;
  return [...activeDays, dateStr];
};

const isActiveDay = (activeDays: ActiveDays, day: dayjs.Dayjs): boolean => {
  return activeDays.includes(toDateString(day));
};

const getCurrentStreak = (activeDays: ActiveDays): number => {
  let daysBack = 0;
  let day = dayjs();
  while (isActiveDay(activeDays, day)) {
    day = day.add(-1, "day");
    daysBack += 1;
  }
  return daysBack;
};

export type StreakSlice = {
  activeDays: ActiveDays;
  streak: number;
  isActiveDay: (day: dayjs.Dayjs) => boolean;
  addToday: () => void;
};

export const createStreakSlice: BoundStateCreator<StreakSlice> = (
  set,
  get,
) => ({
  activeDays: [],
  streak: 0,
  isActiveDay: (day: dayjs.Dayjs) => isActiveDay(get().activeDays, day),
  addToday: () => {
    const activeDays = addActiveDay(get().activeDays, dayjs());
    set({ activeDays, streak: getCurrentStreak(activeDays) });
  },
});
