import type { NextPage } from "next";
import React, { useState } from "react";

// Import các thành phần UI
import { Button } from "~/components/ui/button";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";

// Dữ liệu bảng chữ cái
const hiragana = [
  { character: "あ", romanji: "a" },
  { character: "い", romanji: "i" },
  { character: "う", romanji: "u" },
  { character: "え", romanji: "e" },
  { character: "お", romanji: "o" },
  { character: "か", romanji: "ka" },
  { character: "き", romanji: "ki" },
  { character: "く", romanji: "ku" },
  { character: "け", romanji: "ke" },
  { character: "こ", romanji: "ko" },
  { character: "さ", romanji: "sa" },
  { character: "し", romanji: "shi" },
  { character: "す", romanji: "su" },
  { character: "せ", romanji: "se" },
  { character: "そ", romanji: "so" },
  { character: "た", romanji: "ta" },
  { character: "ち", romanji: "chi" },
  { character: "つ", romanji: "tsu" },
  { character: "て", romanji: "te" },
  { character: "と", romanji: "to" },
  { character: "な", romanji: "na" },
  { character: "に", romanji: "ni" },
  { character: "ぬ", romanji: "nu" },
  { character: "ね", romanji: "ne" },
  { character: "の", romanji: "no" },
  { character: "は", romanji: "ha" },
  { character: "ひ", romanji: "hi" },
  { character: "ふ", romanji: "fu" },
  { character: "へ", romanji: "he" },
  { character: "ほ", romanji: "ho" },
  { character: "ま", romanji: "ma" },
  { character: "み", romanji: "mi" },
  { character: "む", romanji: "mu" },
  { character: "め", romanji: "me" },
  { character: "も", romanji: "mo" },
  { character: "や", romanji: "ya" },
  { character: "ゆ", romanji: "yu" },
  { character: "よ", romanji: "yo" },
  { character: "ら", romanji: "ra" },
  { character: "り", romanji: "ri" },
  { character: "る", romanji: "ru" },
  { character: "れ", romanji: "re" },
  { character: "ろ", romanji: "ro" },
  { character: "わ", romanji: "wa" },
  { character: "を", romanji: "wo" },
  { character: "ん", romanji: "n" },
];

const katakana = [
  { character: "ア", romanji: "a" },
  { character: "イ", romanji: "i" },
  { character: "ウ", romanji: "u" },
  { character: "エ", romanji: "e" },
  { character: "オ", romanji: "o" },
  { character: "カ", romanji: "ka" },
  { character: "キ", romanji: "ki" },
  { character: "ク", romanji: "ku" },
  { character: "ケ", romanji: "ke" },
  { character: "コ", romanji: "ko" },
  { character: "サ", romanji: "sa" },
  { character: "シ", romanji: "shi" },
  { character: "ス", romanji: "su" },
  { character: "セ", romanji: "se" },
  { character: "ソ", romanji: "so" },
  { character: "タ", romanji: "ta" },
  { character: "チ", romanji: "chi" },
  { character: "ツ", romanji: "tsu" },
  { character: "テ", romanji: "te" },
  { character: "ト", romanji: "to" },
  { character: "ナ", romanji: "na" },
  { character: "ニ", romanji: "ni" },
  { character: "ヌ", romanji: "nu" },
  { character: "ネ", romanji: "ne" },
  { character: "ノ", romanji: "no" },
  { character: "ハ", romanji: "ha" },
  { character: "ヒ", romanji: "hi" },
  { character: "フ", romanji: "fu" },
  { character: "ヘ", romanji: "he" },
  { character: "ホ", romanji: "ho" },
  { character: "マ", romanji: "ma" },
  { character: "ミ", romanji: "mi" },
  { character: "ム", romanji: "mu" },
  { character: "メ", romanji: "me" },
  { character: "モ", romanji: "mo" },
  { character: "ヤ", romanji: "ya" },
  { character: "ユ", romanji: "yu" },
  { character: "ヨ", romanji: "yo" },
  { character: "ラ", romanji: "ra" },
  { character: "リ", romanji: "ri" },
  { character: "ル", romanji: "ru" },
  { character: "レ", romanji: "re" },
  { character: "ロ", romanji: "ro" },
  { character: "ワ", romanji: "wa" },
  { character: "ヲ", romanji: "wo" },
  { character: "ン", romanji: "n" },
];

const kanji = [
  { character: "日", romanji: "nichi" },
  { character: "本", romanji: "hon" },
  { character: "人", romanji: "hito" },
  { character: "大", romanji: "dai" },
  { character: "学", romanji: "gaku" },
  { character: "中", romanji: "naka" },
  { character: "山", romanji: "yama" },
  { character: "川", romanji: "kawa" },
  { character: "田", romanji: "ta" },
  { character: "子", romanji: "ko" },
  { character: "水", romanji: "mizu" },
  { character: "火", romanji: "hi" },
  { character: "木", romanji: "ki" },
  { character: "金", romanji: "kin" },
  { character: "土", romanji: "tsuchi" },
  { character: "天", romanji: "ten" },
  { character: "気", romanji: "ki" },
  { character: "見", romanji: "mi" },
  { character: "行", romanji: "kou" },
  { character: "前", romanji: "zen" },
  { character: "後", romanji: "go" },
  { character: "生", romanji: "sei" },
  { character: "時", romanji: "ji" },
  { character: "今", romanji: "ima" },
  { character: "年", romanji: "nen" },
  { character: "名", romanji: "na" },
  { character: "高", romanji: "taka" },
  { character: "小", romanji: "shou" },
  { character: "白", romanji: "shiro" },
  { character: "赤", romanji: "aka" },
  { character: "青", romanji: "ao" },
  { character: "車", romanji: "kuruma" },
  { character: "電", romanji: "den" },
  { character: "門", romanji: "mon" },
  { character: "書", romanji: "sho" },
  { character: "語", romanji: "go" },
  { character: "食", romanji: "shoku" },
  { character: "飲", romanji: "in" },
  { character: "駅", romanji: "eki" },
  { character: "会", romanji: "kai" },
  { character: "社", romanji: "sha" },
  { character: "店", romanji: "ten" },
  { character: "道", romanji: "dou" },
  { character: "雨", romanji: "ame" },
  { character: "空", romanji: "sora" },
  { character: "海", romanji: "umi" },
  { character: "花", romanji: "hana" },
  { character: "魚", romanji: "sakana" },
  { character: "犬", romanji: "inu" },
  { character: "猫", romanji: "neko" },
];

// Thành phần Bảng chữ cái
const CharacterTable: React.FC<{
  characters: { character: string; romanji: string }[];
}> = ({ characters }) => (
  <div
    className="mx-auto grid gap-3"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, auto)",
      gap: "10px",
      justifyContent: "center",
      maxWidth: "500px",
    }}
  >
    {characters.map((item, index) => (
      <Button
        key={index}
        className="flex h-16 w-20 flex-col items-center justify-center rounded-lg p-2 text-lg shadow-md"
      >
        <span className="text-xl">{item.character}</span>
        <span className="text-sm text-gray-500">{item.romanji}</span>
      </Button>
    ))}
  </div>
);

const Character: NextPage = () => {
  const [selectedTab, setSelectedTab] = useState("Hiragana");

  const getCharacters = () => {
    switch (selectedTab) {
      case "Hiragana":
        return hiragana;
      case "Katakana":
        return katakana;
      case "Kanji":
        return kanji;
      default:
        return [];
    }
  };
  const handleButtonClick = (tab: string) => {
    setSelectedTab(tab);
    console.log(`${tab}`);
  };
  return (
    <div className="flex min-h-screen flex-col md:ml-32 lg:ml-64">
      <TopBar />
      <div className="mb-10">
        <LeftBar selectedTab="Bảng chữ cái" />

        <div className="m-10 flex flex-1 content-center items-center justify-center">
          <div className="container mx-auto">
            {/* Tabs */}
            <div className="mb-10">
              <div className="flex justify-center space-x-4">
                {["Hiragana", "Katakana", "Kanji"].map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => handleButtonClick(tab)}
                    variant={selectedTab === tab ? "sidebarOutline" : "ghost"}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
              {/* Nội dung tab */}
              <div className="mt-6 text-center">
                {selectedTab === "Hiragana" && (
                  <div>
                    <h2 className="mb-6 text-3xl font-bold">
                      Let's learn Hiragana!
                    </h2>
                    <p className="mb-4 text-gray-600">
                      Get to know the main writing system in Japanese
                    </p>
                  </div>
                )}
                {selectedTab === "Katakana" && (
                  <div>
                    <h2 className="mb-6 text-3xl font-bold">
                      Let's learn Katakana!
                    </h2>
                    <p className="mb-4 text-gray-600">
                      Practice characters used for loanwords
                    </p>
                  </div>
                )}
                {selectedTab === "Kanji" && (
                  <div>
                    <h2 className="mb-6 text-3xl font-bold">
                      Let's practice Kanji!
                    </h2>
                    <p className="mb-4 text-gray-600">
                      Practice reading words with kanji characters
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Bảng chữ cái */}
            <CharacterTable characters={getCharacters()} />
          </div>
          <RightBar />
        </div>
      </div>

      <BottomBar selectedTab="Bảng chữ cái" />
    </div>
  );
};

export default Character;
