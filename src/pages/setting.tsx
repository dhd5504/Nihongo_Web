import type { NextPage } from "next";
import React from "react";

import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";

const Shop: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />

      <div className="flex flex-1">
        <LeftBar selectedTab="Cửa hàng" />
        
        <div className="flex-1 flex justify-center items-center">
          {/* Empty space to center content if needed */}
        </div>
        
        <RightBar />
      </div>

      <BottomBar selectedTab="Cửa hàng" />
    </div>
  );
};

export default Shop;
