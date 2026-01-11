import { redirect } from "next/navigation";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";
import { FeedWrapper } from "~/components/feedwrapper";
import { getUnits, getUserProgress } from "~/db/queries";
import { Header } from "~/components/header";
import { Unit } from "~/components/unit";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { manualParsedCoolies } from "~/utils/JWTService";
import { jwtDecode } from "jwt-decode";

type LearnPageProps = {
  userProgress: {
    points: number;
    lessonPercentage: number;
  };
  units: {
    id: number;
    order: number;
    displayOrder?: number;
    title: string;
    description: string;
    level: string;
    lessons: {
      id: number;
      order: number;
      name: string;
      type: string;
      status: string;
    }[];
  }[];
  level: string;
};

const levelOrder: Record<string, number> = {
  N5: 1,
  N4: 2,
  N3: 3,
  N2: 4,
  N1: 5,
};

const LearnPage: NextPage<LearnPageProps> = ({ userProgress, units, level }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <div className="flex flex-1">
        <LeftBar selectedTab="Học" />

        <div className="flex flex-1 items-start justify-center px-6 md:ml-32 lg:ml-64">
          <FeedWrapper>
            <Header title="Tiếng Nhật" />
            {units
              .sort(
                (unitFirst, unitLast) =>
                  (levelOrder[unitFirst.level] ?? 99) -
                  (levelOrder[unitLast.level] ?? 99) ||
                  (unitFirst.displayOrder ?? 0) -
                  (unitLast.displayOrder ?? 0),
              )
              .map(
                (unit: {
                  id: number;
                  order: number;
                  description: string;
                  title: string;
                  level: string;
                  lessons: {
                    id: number;
                    order: number;
                    name: string;
                    type: string;
                    status: string;
                  }[];
                }) => {
                  let activeLesson = null;
                  let isFirst = false;
                  let isLast = false;
                  for (let i = 0; i < unit.lessons.length; i++) {
                    if (unit.lessons[i]?.status === "current") {
                      if (i === 0) isFirst = true;
                      if (i === unit.lessons.length - 1) isLast = true;
                      activeLesson = unit.lessons[i];
                      break;
                    }
                  }

                  // const activeLesson = unit.lessons.find(
                  //   (lesson) => lesson.status === "current",
                  // );

                  return (
                    <div key={unit.id} className="mb-10">
                      <Unit
                        id={unit.id}
                        order={unit.order}
                        description={unit.description}
                        title={unit.title}
                        lessons={unit.lessons}
                        activeLesson={
                          activeLesson
                            ? {
                              id: activeLesson.id,
                              unit: { id: unit.id },
                              isFirst: isFirst,
                              isLast: isLast,
                            }
                            : undefined
                        }
                        activeLessonPercentage={userProgress.lessonPercentage}
                      />
                    </div>
                  );
                },
              )}
          </FeedWrapper>
        </div>

        <RightBar />
      </div>

      <BottomBar selectedTab="Học" />
    </div>
  );
};

export default LearnPage;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const cookies = String(req?.headers?.cookie ?? "");

  const parsedCookies = manualParsedCoolies(cookies);

  const myCookie = parsedCookies["token"] || null;
  const levelCookie = parsedCookies["level"] || null;

  if (!myCookie) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const jwtPayload = jwtDecode<{
    id: number;
  }>(myCookie);


  const [userProgress, units] = await Promise.all([
    getUserProgress(),
    getUnits(jwtPayload.id, myCookie),
  ]);

  const filteredUnits =
    levelCookie != null && levelCookie !== ""
      ? units.filter(
        (unit: { level: string }) =>
          unit.level?.toUpperCase() === levelCookie.toUpperCase(),
      )
      : units;

  if (!userProgress) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {
      userProgress,
      units: filteredUnits,
      level: levelCookie ?? "",
    },
  };
}
