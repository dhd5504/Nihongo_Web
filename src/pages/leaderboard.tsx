import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { LeftBar } from "~/components/LeftBar";
import { BottomBar } from "~/components/BottomBar";
import { useLeaderboardUsers } from "~/hooks/useLeaderboard";
import {
  BronzeLeagueSvg,
  FirstPlaceSvg,
  SecondPlaceSvg,
  ThirdPlaceSvg,
  LockedLeagueSvg,
} from "~/components/Svgs";
import { useRouter } from "next/router";
import Image from "next/image";
import { getIdUserByToken, getToken } from "~/utils/JWTService";
import { experienceByLevel } from "~/db/queries";
import Link from "next/link";
import { Button } from "~/components/ui/button";

const defaultPicture =
  "https://d35aaqx5ub95lt.cloudfront.net/images/leagues/2439bac00452e99ba7bf6a7ed0b04196.svg";

const LeaderboardProfile = ({
  place,
  name,
  exp,
  userId,
}: {
  place: number;
  name: string;
  exp: number;
  userId: number;
}) => {
  const ownId = getIdUserByToken();

  return (
    <div
      className={`flex items-center gap-5 rounded-2xl px-5 py-2 hover:bg-gray-100 md:mx-0 ${userId === ownId && "bg-blue-100"}`}
    >
      <div className="flex items-center gap-4">
        {place === 1 ? (
          <FirstPlaceSvg />
        ) : place === 2 ? (
          <SecondPlaceSvg />
        ) : place === 3 ? (
          <ThirdPlaceSvg />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center font-bold text-green-700">
            {place}
          </div>
        )}
        <Image
          width={48}
          height={48}
          className="h-12 w-12 rounded-full"
          src={defaultPicture}
          alt="User Avatar"
        />
      </div>
      <div className="grow overflow-hidden overflow-ellipsis">{name}</div>
      <div className="shrink-0 text-gray-500">{`${exp} EXP`}</div>
    </div>
  );
};

type Experience = {
  userId: number;
  name: string;
  exp: number;
};

const Leaderboard: NextPage = () => {
  const [selectedTab, setSelectedTab] = useState("N1");
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const leaderboardLeague = "Bảng xếp hạng";

  const handleButtonClick = (tab: string) => {
    setSelectedTab(tab);
  };

  const fetching = async (level: string) => {
    const exs = await experienceByLevel(level);
    setExperiences(exs ?? []);
  };

  useEffect(() => {
    fetching(selectedTab);
  }, [selectedTab]);

  if (!experiences) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-800">404</h1>
          <p className="text-2xl font-medium text-gray-600">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="mt-4 text-gray-500">
            The link might be broken, or the page may have been removed.
          </p>
          <div className="mt-6">
            <Link
              href="/leaderboard"
              className="rounded-lg bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
            >
              Go to Leader Board
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:ml-24 lg:ml-64">
      <LeftBar selectedTab="Bảng xếp hạng" />

      <div className="flex justify-center gap-3 pt-14 md:p-6 md:pt-10 lg:gap-12">
        <div className="flex w-full max-w-xl flex-col items-center gap-5 pb-28 md:px-5">
          <div className="sticky top-0 -mt-14 flex w-full flex-col items-center gap-5 bg-white pt-14">
            <div className="flex items-center gap-5">
              <BronzeLeagueSvg className="h-fit w-20" />
              <LockedLeagueSvg />
              <LockedLeagueSvg />
              <LockedLeagueSvg />
              <LockedLeagueSvg />
            </div>
            <h1 className="text-2xl font-bold">{leaderboardLeague}</h1>
            <div className="w-full border-b-2 border-gray-200"></div>
          </div>
          <div className="mt-10">
            <div className="flex justify-center space-x-4">
              {["N1", "N2", "N3", "N4", "N5"].map((tab) => (
                <Button
                  key={tab}
                  onClick={() => handleButtonClick(tab)}
                  variant={selectedTab === tab ? "sidebarOutline" : "ghost"}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>
          {experiences.length === 0 && <div>Chưa tham gia</div>}
          <div className="w-full">
            {experiences
              .sort((a, b) => b.exp - a.exp)
              .map((user, i) => (
                <LeaderboardProfile
                  key={user.userId}
                  place={i + 1}
                  name={user.name}
                  exp={user.exp}
                  userId={user.userId}
                />
              ))}
          </div>
        </div>
      </div>
      <BottomBar selectedTab="Bảng xếp hạng" />
    </div>
  );
};
export const getServerSideProps = () => {
  return {
    props: {}, // Không truyền props nào
  };
};
export default Leaderboard;
