import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils"; // Ensure you have a utility function for merging classes
 
type TabsProps = {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
};
 
const tabVariants = cva(
  "cursor-pointer font-bold transition-colors text-gray-400 pb-2",
  {
    variants: {
      active: {
        true: "text-blue-500 border-b-2 border-blue-500",
        false: "hover:text-blue-500",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
 
const Tabs: React.FC<TabsProps> = ({ selectedTab, setSelectedTab }) => {
  const tabs = ["Hiragana", "Katakana", "Kanji"];
 
  return (
    <div className="flex justify-center items-center space-x-20 border-b border-gray-300 mb-4">
      {tabs.map((tab) => (
        <div
          key={tab}
          onClick={() => setSelectedTab(tab)}
          className={cn(tabVariants({ active: selectedTab === tab }))}
        >
          {tab.toUpperCase()}
        </div>
      ))}
    </div>
  );
};
 
export { Tabs };