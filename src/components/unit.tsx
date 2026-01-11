import { LessonButton } from "~/components/lesson-button";
import { UnitBanner } from "~/components/unit-banner";

type UnitProps = {
  id: number;
  order: number;
  title: string;
  description: string;
  lessons: {
    id: number;
    order: number;
    status: string; // current, completed, locked
    type?: string;
  }[];
  activeLesson:
    | {
        id: number;
        unit: {
          id: number;
        };
        isFirst: boolean;
        isLast: boolean;
      }
    | undefined;
  activeLessonPercentage: number;
};

export const Unit = ({
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
}: UnitProps) => {
  return (
    <>
      <UnitBanner
        title={title}
        description={description}
        activeLessonId={activeLesson?.id ?? null}
        isFirst={activeLesson?.isFirst}
        isLast={activeLesson?.isLast}
      />

      <div className="relative flex flex-col items-center">
        {lessons?.map((lesson, i) => {
          const isCurrent = lesson.status === "current";
          const isLocked = lesson.status === "locked";

          return (
            <LessonButton
              key={lesson.id}
              id={Number(lesson.id)}
              index={i}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={activeLessonPercentage}
              lessonType={lesson.type}
            />
          );
        })}
      </div>
    </>
  );
};
