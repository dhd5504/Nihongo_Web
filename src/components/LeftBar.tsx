import Link from "next/link";
import type { ComponentProps } from "react";
import React, { useState } from "react";
import type { Tab } from "./BottomBar";
import { useBottomBarItems } from "./BottomBar";
import type { LoginScreenState } from "./LoginScreen";
import { LoginScreen } from "./LoginScreen";
import { GlobeIconSvg, PodcastIconSvg } from "./Svgs";
import { useBoundStore } from "src/hooks/useBoundStore";
import { logout } from "~/utils/JWTService";
import { ChatBotIcon } from "./ChatBotIcon";

type SidebarTab = Tab | "Chat Bot AI";

const LeftBarMoreMenuSvg = (props: ComponentProps<"svg">) => {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" {...props}>
      <circle
        cx="23"
        cy="23"
        r="19"
        fill="#CE82FF"
        stroke="#CE82FF"
        strokeWidth="2"
      />
      <circle cx="15" cy="23" r="2" fill="white" />
      <circle cx="23" cy="23" r="2" fill="white" />
      <circle cx="31" cy="23" r="2" fill="white" />
    </svg>
  );
};

export const LeftBar = ({
  selectedTab,
}: {
  selectedTab: SidebarTab | null;
}) => {
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const logOut = () => {
    logout(() => {
      window.location.href = "/";
    });
  };
  const [moreMenuShown, setMoreMenuShown] = useState(false);
  const [loginScreenState, setLoginScreenState] =
    useState<LoginScreenState>("HIDDEN");

  const bottomBarItems = useBottomBarItems();
  const isChatSelected = selectedTab === "Chat Bot AI";

  return (
    <>
      <nav className="fixed bottom-0 left-0 top-0 z-50 hidden flex-col gap-5 border-r-2 border-[#e5e5e5] bg-white p-3 md:flex lg:w-64 lg:p-5">
        <Link
          href="/learn"
          className="mb-5 ml-5 mt-5 hidden text-3xl font-bold text-[#58cc02] lg:block"
        >
          Nihongo
        </Link>
        <ul className="flex flex-col items-stretch gap-3">
          {bottomBarItems.map((item) => {
            return (
              <li key={item.href} className="flex flex-1">
                {item.name === selectedTab ? (
                  <Link
                    href={item.href}
                    className="flex grow items-center gap-3 rounded-xl border-2 border-[#84d8ff] bg-[#ddf4ff] px-2 py-1 text-sm font-bold uppercase text-blue-400"
                  >
                    {item.icon}{" "}
                    <span className="sr-only lg:not-sr-only">{item.name}</span>
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    className="flex grow items-center gap-3 rounded-xl px-2 py-1 text-sm font-bold uppercase text-gray-400 hover:bg-gray-100"
                  >
                    {item.icon}{" "}
                    <span className="sr-only lg:not-sr-only">{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
          <li className="flex flex-1">
            <Link
              href="/chat"
              className={[
                "flex grow items-center gap-3 rounded-xl px-2 py-1 text-sm font-bold uppercase",
                isChatSelected
                  ? "border-2 border-[#84d8ff] bg-[#ddf4ff] text-blue-400"
                  : "text-gray-400 hover:bg-gray-100",
              ].join(" ")}
            >
              <ChatBotIcon className="h-10 w-10" />
              <span className="sr-only lg:not-sr-only">Chat Bot AI</span>
            </Link>
          </li>
          <div
            className="relative flex grow cursor-default items-center gap-3 rounded-xl px-2 py-1 font-bold uppercase text-gray-400 hover:bg-gray-100"
            onClick={() => setMoreMenuShown((x) => !x)}
            onMouseEnter={() => setMoreMenuShown(true)}
            onMouseLeave={() => setMoreMenuShown(false)}
            role="button"
            tabIndex={0}
          >
            <LeftBarMoreMenuSvg />{" "}
            <span className="hidden text-sm lg:inline">Thêm</span>
            <div
              className={[
                "absolute left-full top-[-10px] z-20 min-w-[300px] rounded-2xl border-2 border-gray-300 bg-white text-left text-gray-400",
                moreMenuShown ? "" : "hidden",
              ].join(" ")}
            >
              <div className="flex flex-col py-2">
                <Link
                  className="flex items-center gap-4 px-5 py-2 text-left uppercase hover:bg-gray-100"
                  href="https://schools.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GlobeIconSvg className="h-10 w-10" />
                  Trường học
                </Link>
                <Link
                  className="flex items-center gap-4 px-5 py-2 text-left uppercase hover:bg-gray-100"
                  href="https://podcast.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PodcastIconSvg className="h-10 w-10" />
                  Podcast
                </Link>
              </div>
              <div className="flex flex-col border-t-2 border-gray-300 py-2">
                <Link
                  className="px-5 py-2 text-left uppercase hover:bg-gray-100"
                  href={loggedIn ? "/settings/account" : "/settings/sound"}
                >
                  Cài đặt
                </Link>
                <Link
                  className="px-5 py-2 text-left uppercase hover:bg-gray-100"
                  href="https://example.com/help"
                >
                  Trợ giúp
                </Link>
                <button
                  className="px-5 py-2 text-left uppercase hover:bg-gray-100"
                  onClick={logOut}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </ul>
      </nav>
      <LoginScreen
        loginScreenState={loginScreenState}
        setLoginScreenState={setLoginScreenState}
      />
    </>
  );
};
