"use client";
import { NotebookText } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { SessionKey, SessionStorage } from "../utils/session-storage";

type UnitBannerProps = {
  title: string;
  description: string;
  activeLessonId: number | null;
  isFirst?: boolean;
  isLast?: boolean;
  isPractice?: boolean;
};

export const UnitBanner = ({
  title,
  description,
  activeLessonId,
  isFirst = false,
  isLast = false,
  isPractice = false,
}: UnitBannerProps) => {
  let link = `/lesson/${activeLessonId}`;

  if (isFirst) {
    link += "?type=FLASHCARD";
  } else if (isLast) {
    link += "?type=MULTIPLE_CHOICE&state=test";
  } else {
    link += "?type=MULTIPLE_CHOICE";
  }
  return (
    <div className="flex w-full flex-wrap items-center justify-between rounded-xl bg-green-500 p-5 text-white">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      {activeLessonId && !isPractice && (
        <Link href={link}>
          <Button
            size="lg"
            variant="secondary"
            className="border-2 border-b-4 active:border-b-2 xl:flex"
          >
            <NotebookText className="mr-2" />
            Continue
          </Button>
        </Link>
      )}
      {isPractice && (
        <Link href={`/practice?unitId=${activeLessonId}`}>
          <Button
            size="lg"
            variant="secondary"
            className="border-2 border-b-4 active:border-b-2 xl:flex"
          >
            <NotebookText className="mr-2" />
            Practice
          </Button>
        </Link>
      )}
    </div>
  );
};
