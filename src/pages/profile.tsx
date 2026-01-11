import { jwtDecode } from "jwt-decode";
import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import {
  BronzeLeagueSvg,
  EditPencilSvg,
  EmptyFireSvg,
  EmptyMedalSvg,
  FireSvg,
  LightningProgressSvg,
  SettingsGearSvg,
} from "~/components/Svgs";
import { getProfile } from "~/db/queries";
import { getToken, manualParsedCoolies } from "~/utils/JWTService";
import { useWalletStore } from "~/stores/useWalletStore";
import { getTokenContract } from "~/utils/contracts";
import { ethers } from "ethers";

// Define the type for the user data
export interface UserData {
  name: string;
  userXP: number;
  phone: string;
  email: string;
  avatar?: string | null;
}

const Profile: NextPage<{
  profile: UserData;
}> = ({ profile }) => {
  return (
    <div>
      <ProfileTopBar />
      <LeftBar selectedTab="Hồ sơ" />
      <div className="flex justify-center gap-3 pt-14 md:ml-24 lg:ml-64 lg:gap-12">
        <div className="flex w-full max-w-4xl flex-col gap-5 p-5">
          <ProfileTopSection userData={profile} />
          <ProfileStatsSection userXP={profile.userXP} />
        </div>
      </div>
      <div className="pt-[90px]"></div>
      <BottomBar selectedTab="Hồ sơ" />
    </div>
  );
};

export default Profile;

const ProfileTopBar = () => {
  return (
    <div className="fixed left-0 right-0 top-0 flex h-16 items-center justify-between border-b-2 border-gray-200 bg-white px-5 text-xl font-bold text-gray-300 md:hidden">
      <div className="invisible" aria-hidden={true}>
        <SettingsGearSvg />
      </div>
      <span className="text-gray-400">Hồ sơ</span>
      <Link href="/settings/account">
        <SettingsGearSvg />
        <span className="sr-only">Cài đặt</span>
      </Link>
    </div>
  );
};
const ProfileTopSection = ({ userData }: { userData: UserData }) => {
  const router = useRouter();
  const loggedIn = getToken; // Replace with your logic for checking if user is logged in
  const { walletAddress, connectWallet, disconnectWallet } = useWalletStore();
  const [frameInfo, setFrameInfo] = useState<{ id: number; img: string } | null>(null);

  useEffect(() => {
    if (!loggedIn) {
      void router.push("/");
    }
  }, [loggedIn, router]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedFrame");
    if (saved) {
      const id = Number(saved);
      if (id > 0) {
        setFrameInfo({ id, img: `/avatar-frames/frame-${id}.svg` });
      } else {
        setFrameInfo(null);
      }
    } else {
      setFrameInfo(null);
    }
  }, []);

  const { name, phone, email, avatar } = userData;

  return (
    <section className="flex flex-row-reverse items-center border-b-2 border-gray-200 pb-8 md:flex-row md:gap-8">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-400 text-3xl font-bold text-gray-400 md:h-44 md:w-44 md:text-7xl">
        {avatar ? (
          <img
            src={avatar}
            alt={`${name} avatar`}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          (name.charAt(0) || "?").toUpperCase()
        )}
        {frameInfo && (
          <img
            src={frameInfo.img}
            alt="Avatar Frame"
            className="absolute -left-2 -top-2 h-24 w-24 max-w-none md:-left-4 md:-top-4 md:h-52 md:w-52 pointer-events-none"
          />
        )}
      </div>
      <div className="flex grow flex-col justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <div className="mt-5 text-sm text-gray-400">Phone: {phone}</div>
            <div className="text-sm text-gray-400">Email: {email}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={walletAddress ? disconnectWallet : connectWallet}
            className={`rounded-xl px-4 py-2 font-bold text-white transition ${walletAddress ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              }`}
          >
            {walletAddress
              ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>
      </div>
      <Link
        href="/settings/account"
        className="hidden items-center gap-2 self-start rounded-2xl border-b-4 border-blue-500 bg-blue-400 px-5 py-3 font-bold uppercase text-white transition hover:brightness-110 md:flex"
      >
        <EditPencilSvg />
        Chỉnh sửa hồ sơ
      </Link>
    </section>
  );
};

const ProfileStatsSection = ({ userXP }: { userXP: number }) => {
  const streak = 0; // Replace with your logic for fetching the user's streak
  const league = "Bronze";
  const top3Finishes = 0;

  const { walletAddress, provider } = useWalletStore();
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress || !provider) {
        setBalance("0");
        return;
      }
      try {
        const token = await getTokenContract(provider);
        if (!token || typeof token.balanceOf !== "function") {
          setBalance("0");
          return;
        }
        const bal = await token.balanceOf(walletAddress);
        // Format to whole numbers for display simplicity
        const formatted = ethers.formatUnits(bal, 18).split(".")[0];
        setBalance(formatted || "0");
      } catch (error) {
        console.error("Failed to fetch balance", error);
      }
    };
    fetchBalance();
  }, [walletAddress, provider]);

  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold">Thống kê</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex gap-2 rounded-2xl border-2 border-gray-200 p-2 md:gap-3 md:px-6 md:py-4">
          {streak === 0 ? <EmptyFireSvg /> : <FireSvg />}
          <div className="flex flex-col">
            <span
              className={[
                "text-xl font-bold",
                streak === 0 ? "text-gray-400" : "",
              ].join(" ")}
            >
              {streak}
            </span>
            <span className="text-sm text-gray-400 md:text-base">
              Chuỗi ngày
            </span>
          </div>
        </div>
        <div className="flex gap-2 rounded-2xl border-2 border-gray-200 p-2 md:gap-3 md:px-6 md:py-4">
          <LightningProgressSvg size={35} />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{userXP}</span>
            <span className="text-sm text-gray-400 md:text-base">Tổng XP</span>
          </div>
        </div>
        <div className="flex gap-2 rounded-2xl border-2 border-gray-200 p-2 md:gap-3 md:px-6 md:py-4">
          <BronzeLeagueSvg width={25} height={35} />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{league}</span>
            <span className="text-sm text-gray-400 md:text-base">
              Hạng đấu hiện tại
            </span>
          </div>
        </div>
        <div className="flex gap-2 rounded-2xl border-2 border-gray-200 p-2 md:gap-3 md:px-6 md:py-4">
          {top3Finishes === 0 ? <EmptyMedalSvg /> : <EmptyMedalSvg />}
          <div className="flex flex-col">
            <span
              className={[
                "text-xl font-bold",
                top3Finishes === 0 ? "text-gray-400" : "",
              ].join(" ")}
            >
              {top3Finishes}
            </span>
            <span className="text-sm text-gray-400 md:text-base">
              Hoàn thành Top 3
            </span>
          </div>
        </div>
        {/* Token Balance */}
        <div className="flex gap-2 rounded-2xl border-2 border-gray-200 p-2 md:gap-3 md:px-6 md:py-4 col-span-2 sm:col-span-1">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-yellow-100 text-2xl">🪙</div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">{balance} NIHON</span>
            <span className="text-sm text-gray-400 md:text-base">
              Token Balance
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
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

  const profile = await getProfile(jwtPayload.id);
  console.log(profile);

  return {
    props: { profile },
  };
}
