import { FeedWrapper } from "~/components/feedwrapper";
import { getPracticeUnit, getUnits, type Unit } from "~/db/queries";
import { Header } from "~/components/header";
import { UnitBanner } from "~/components/unit-banner";
import { Quiz } from "~/lesson/quiz";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { manualParsedCoolies } from "~/utils/JWTService";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

type PracticeChallenge = {
  id: number | string;
  challengeId: number | string;
  text: string;
  correct: string;
  question?: string;
  imageSrc?: string;
  audioSrc?: string;
  challengeOptions: {
    id: number | string;
    challengeId: number | string;
    option: string;
    isCorrect: boolean;
    imageSrc?: string;
    audioSrc?: string;
  }[];
  completed: boolean;
  type: string;
};

type PracticePageProps = {
  practiceLessons: PracticeChallenge[];
  practices: Unit[];
  unitId: string | null;
};

const PracticeLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <div className="flex flex-1">
        <LeftBar selectedTab="Luyện tập" />

        <div className="flex flex-1 justify-center">{children}</div>

        <RightBar />
      </div>

      <BottomBar selectedTab="Luyện tập" />
    </div>
  );
};

const PracticePage: NextPage<PracticePageProps> = ({
  practiceLessons,
  practices,
  unitId,
}) => {
  if (unitId) {
    return (
      <PracticeLayout>
        <div className="flex flex-1 flex-col md:ml-32 lg:ml-64">
          {practiceLessons.length === 0 ? (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="mt-4 text-gray-500">
                  Có vẻ bạn đã hoàn thành hoặc chưa đến phần này!
                </p>
                <div className="mt-6">
                  <Link
                    href="/practice"
                    className="rounded-lg bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
                  >
                    Go to Practice
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <Quiz
              initialLessonId={Number(unitId)}
              initialLessonChallenges={practiceLessons.map((challenge) => ({
                ...challenge,
                id: Number(challenge.id),
                challengeId: Number(challenge.id),
                imageSrc: challenge.imageSrc ?? "",
                audioSrc: challenge.audioSrc ?? "",
                challengeOptions: (challenge.challengeOptions ?? []).map((option) => ({
                  ...option,
                  id: Number(option.id),
                  challengeId: Number(challenge.id),
                  option: String(option.option),
                  isCorrect: Boolean(option.isCorrect),
                  imageSrc: option.imageSrc ?? "",
                  audioSrc: option.audioSrc ?? "",
                })),
                type: String(challenge.type),
              }))}
              initialPercentage={
                (practiceLessons.filter(
                  (challenge: { completed: boolean }) => challenge.completed,
                ).length /
                  practiceLessons.length) *
                100
              }
              isLesson={false}
              isTest={false}
              isPractice={true}
            />
          )}
        </div>
      </PracticeLayout>
    );
  }

  return (
    <PracticeLayout>
      <div className="flex w-full flex-row-reverse gap-[48px] px-6 md:ml-32 lg:ml-64">
        <FeedWrapper>
          <Header title="Japanese" />
          <div className="flex flex-col gap-3">
            {practices.map((practice) => (
              <UnitBanner
                key={practice.id}
                title={practice.title}
                description={practice.description}
                activeLessonId={practice.id}
                isPractice
              />
            ))}
          </div>
        </FeedWrapper>
      </div>
    </PracticeLayout>
  );
};

export default PracticePage;

export async function getServerSideProps({
  query,
  req,
}: GetServerSidePropsContext) {
  const cookies = String(req?.headers?.cookie ?? "");

  const parsedCookies = manualParsedCoolies(cookies);

  const myCookie = parsedCookies["token"] || null;

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

  const unitIdParam = Array.isArray(query.unitId)
    ? query.unitId[0]
    : query.unitId; // Access searchParams

  if (unitIdParam) {
    try {
      const practiceLessons = await getPracticeUnit(
        jwtPayload.id,
        Number(unitIdParam.toString()),
        myCookie, // Pass JWT token for SSR authentication
      );

      return {
        props: {
          practiceLessons: practiceLessons ?? [],
          practices: [],
          unitId: unitIdParam,
        },
      };
    } catch (error) {
      console.error("Error fetching practice unit:", error);
      return {
        redirect: {
          destination: "/practice",
        },
      };
    }
  }

  const practices = await getUnits(jwtPayload.id, myCookie);

  return {
    props: {
      practiceLessons: [],
      practices: practices ?? [],
      unitId: null,
    },
  };
}
