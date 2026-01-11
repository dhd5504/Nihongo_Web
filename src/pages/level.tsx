import { type GetServerSidePropsContext, type NextPage } from "next";
import { jwtDecode } from "jwt-decode";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";
import { FeedWrapper } from "~/components/feedwrapper";
import { Header } from "~/components/header";
import { Unit } from "~/components/unit";
import { getUnits, getUserProgress } from "~/db/queries";
import { manualParsedCookies } from "~/utils/JWTService";

const LevelPage: NextPage<{
  userProgress: { points: number; lessonPercentage: number };
  units: any[];
  level: string;
}> = ({ userProgress, units, level }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <div className="flex flex-1">
        <LeftBar selectedTab={null} />
        <div className="flex flex-1 items-start justify-center px-6 md:ml-32 lg:ml-64">
          <FeedWrapper>
            <Header title={`Trình độ ${level}`} />
            {units
              .filter((unit) => unit.level === level)
              .sort(
                (a, b) =>
                  Number(a.displayOrder ?? a.order ?? 0) -
                  Number(b.displayOrder ?? b.order ?? 0),
              )
              .map((unit) => {
                const activeLesson = unit.lessons.find(
                  (lesson: { status: string }) => lesson.status === "current",
                );
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
                            isFirst:
                              unit.lessons.findIndex(
                                (l: { id: number }) => l.id === activeLesson.id,
                              ) === 0,
                            isLast:
                              unit.lessons.findIndex(
                                (l: { id: number }) => l.id === activeLesson.id,
                              ) ===
                              unit.lessons.length - 1,
                          }
                          : undefined
                      }
                      activeLessonPercentage={userProgress.lessonPercentage}
                    />
                  </div>
                );
              })}
          </FeedWrapper>
        </div>
        <RightBar />
      </div>
      <BottomBar selectedTab={null} />
    </div>
  );
};

export default LevelPage;

export async function getServerSideProps({
  req,
  query,
}: GetServerSidePropsContext) {
  const cookies = String(req?.headers?.cookie ?? "");
  const parsedCookies = manualParsedCookies(cookies);
  const token = parsedCookies["token"] || null;

  if (!token) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const jwtPayload = jwtDecode<{
    id: number;
  }>(token);

  const level = String(query.level ?? "");

  const [userProgress, units] = await Promise.all([
    getUserProgress(),
    getUnits(jwtPayload.id, token),
  ]);

  return {
    props: {
      userProgress,
      units,
      level,
    },
  };
}
