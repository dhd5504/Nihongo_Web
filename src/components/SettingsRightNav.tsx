import Link from "next/link";
import React from "react";
import { useBoundStore } from "src/hooks/useBoundStore";

type SettingsTitle = ReturnType<typeof useSettingsPages>[number]["title"];

const useSettingsPages = () => {
  const loggedIn = useBoundStore((x) => x.loggedIn);
  return loggedIn
    ? ([
        { title: "Tài khoản", href: "/settings/account" },
        { title: "Âm thanh", href: "/settings/sound" },
        { title: "Chỉnh sửa mục tiêu hàng ngày", href: "/settings/coach" },
      ] as const)
    : ([
        { title: "Âm thanh", href: "/settings/sound" },
        { title: "Chỉnh sửa mục tiêu hàng ngày", href: "/settings/coach" },
      ] as const);
};

export const SettingsRightNav = ({
  selectedTab,
}: {
  selectedTab: SettingsTitle;
}) => {
  const settingsPages = useSettingsPages();
  return (
    <div className="hidden h-fit w-80 flex-col gap-1 rounded-2xl border-2 border-gray-200 p-5 lg:flex">
      {settingsPages.map(({ title, href }) => {
        return (
          <Link
            key={title}
            href={href}
            className={[
              "rounded-2xl p-4 font-bold hover:bg-gray-300",
              title === selectedTab ? "bg-gray-300" : "",
            ].join(" ")}
          >
            {title}
          </Link>
        );
      })}
    </div>
  );
};
