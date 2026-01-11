import Link from "next/link";
import { LanguageDropDown } from "./LanguageDropDown";
import { DuolingoHeader } from "./Svgs"; 

export const LanguageHeader = () => {
  return (
    <header className="fixed left-0 right-0 top-0 mx-auto flex min-h-[70px] max-w-5xl items-center justify-between bg-white px-10 font-bold text-black">
      <Link href="/">
        <DuolingoHeader className="text-4xl" />
      </Link>
      <LanguageDropDown />
    </header>
  );
};
