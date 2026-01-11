import type { NextPage } from "next";
import React from "react";

import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";
import { StreakFreezeSvg, EmptyGemSvg, DoubleOrNothingSvg } from "~/components/Svgs";
import { useWalletStore } from "~/stores/useWalletStore";
import { useToast } from "~/context/toast";
import { getTokenContract, getShopContract, SHOP_ADDRESS } from "~/utils/contracts";
import { ethers } from "ethers";

const Shop: NextPage = () => {
  const streakFreezes = 0;

  const { walletAddress, provider } = useWalletStore();
  const { addToast } = useToast();
  const [ownedItems, setOwnedItems] = React.useState<Set<number>>(
    new Set([1]), // Frame 1 is always free/owned
  );

  const ITEMS = [
    { id: 1, name: "Frame 1", price: "0", img: "/avatar-frames/frame-1.svg", desc: "A cool blue frame (FREE)." },
    { id: 2, name: "Frame 2", price: "20", img: "/avatar-frames/frame-2.svg", desc: "A fiery red frame." },
    { id: 3, name: "Frame 3", price: "30", img: "/avatar-frames/frame-3.svg", desc: "A nature green frame." },
    { id: 4, name: "Frame 4", price: "30", img: "/avatar-frames/frame-4.svg", desc: "A golden luxury frame." },
  ];

  // Fetch ownership status
  React.useEffect(() => {
    const checkOwnership = async () => {
      if (!walletAddress || !provider) return;
      try {
        const shop = await getShopContract(provider);
        if (!shop || typeof shop.hasPurchased !== "function") {
          return;
        }
        const owned = new Set<number>([1]); // Frame 1 is free
        for (const item of ITEMS) {
          const hasPurchased = await shop.hasPurchased(walletAddress, item.id);
          if (hasPurchased) owned.add(item.id);
        }
        setOwnedItems(owned);
      } catch (err) {
        console.error("Failed to fetch shop items", err);
      }
    };
    checkOwnership();
  }, [walletAddress, provider]);

  const handleBuy = async (itemId: number, price: string, itemName: string) => {
    if (price === "0") {
      setOwnedItems(prev => new Set(prev).add(itemId));
      addToast(`You now own ${itemName}!`, "success");
      return;
    }

    if (!walletAddress || !provider) {
      addToast("Please connect wallet first!", "error");
      return;
    }

    try {
      const network = await provider.getNetwork();
      console.log("Current Network:", network.chainId, network.name);
      console.log("Token Address:", process.env.NEXT_PUBLIC_TOKEN_ADDRESS);
      console.log("Shop Address:", process.env.NEXT_PUBLIC_SHOP_ADDRESS);

      if (Number(network.chainId) !== 11155111) { // Sepolia ChainID
        addToast("Wrong Network! Please switch to Sepolia.", "error");
        return;
      }

      addToast("Checking balance & allowance...", "info");
      const token = await getTokenContract(provider);
      const shop = await getShopContract(provider);
      if (
        !token ||
        typeof token.balanceOf !== "function" ||
        typeof token.allowance !== "function" ||
        typeof token.approve !== "function" ||
        !shop ||
        typeof shop.buyItem !== "function"
      ) {
        addToast("Contract not ready, please reconnect wallet.", "error");
        return;
      }

      // 0. Check Balance Logic
      const priceWei = ethers.parseUnits(price, 18);
      const balance = await token.balanceOf(walletAddress);

      if (balance < priceWei) {
        addToast("Không đủ token, hãy chăm chỉ luyện tập hơn nhé", "error");
        return;
      }

      // 1. Check Allowance
      const allowance = await token.allowance(walletAddress, SHOP_ADDRESS);

      if (allowance < priceWei) {
        addToast("Approving tokens...", "info");
        const txApprove = await token.approve(SHOP_ADDRESS, priceWei);
        await txApprove.wait();
        addToast("Approved! Now buying...", "success");
      }

      // 2. Buy Item
      addToast(`Buying ${itemName}...`, "info");
      const txBuy = await shop.buyItem(itemId);
      await txBuy.wait();

      addToast(`Successfully bought ${itemName}!`, "success");
      setOwnedItems(prev => {
        const newSet = new Set(prev);
        newSet.add(itemId);
        return newSet;
      });

    } catch (error: any) {
      console.error(error);
      addToast("Transaction failed: " + (error.message || "Unknown error"), "error");
    }
  };

  return (
    <div>
      <TopBar />
      <LeftBar selectedTab="Cửa hàng" />
      <div className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12">
        <div className="px-4 pb-20">
          <div className="py-7">
            <h2 className="mb-5 text-2xl font-bold">Vật phẩm</h2>
            <div className="flex border-t-2 border-gray-300 py-5">
              <StreakFreezeSvg className="shrink-0" />
              <section className="flex flex-col gap-3">
                <h3 className="text-lg font-bold">Streak Freeze</h3>
                <p className="text-sm text-gray-500">
                  Streak Freeze cho phép chuỗi của bạn được giữ nguyên trong một lần
                  cả ngày không hoạt động.
                </p>
                <div className="w-fit rounded-full bg-gray-200 px-3 py-1 text-sm font-bold uppercase text-gray-400">
                  {streakFreezes} / 2 có sẵn
                </div>
                <button
                  className="flex w-fit items-center gap-1 rounded-2xl border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold uppercase text-gray-300"
                  disabled
                >
                  MUA: <EmptyGemSvg /> 10
                </button>
              </section>
            </div>
            <div className="flex border-t-2 border-gray-300 py-5">
              <DoubleOrNothingSvg className="shrink-0" />
              <section className="flex flex-col gap-3">
                <h3 className="text-lg font-bold">Double or Nothing</h3>
                <p className="text-sm text-gray-500">
                  Hãy nỗ lực gấp đôi số tiền cược năm lingot của bạn bằng cách duy trì chuỗi thắng trong bảy ngày liên tiếp.
                </p>
                <button
                  className="flex w-fit items-center gap-1 rounded-2xl border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold uppercase text-gray-300"
                  disabled
                >
                  MUA: <EmptyGemSvg /> 5
                </button>
              </section>
            </div>
          </div>

          <div className="py-7">
            <h2 className="mb-5 text-2xl font-bold text-purple-600">Token Shop (Avatar Frames)</h2>

            {ITEMS.map((item) => (
              <div key={item.id} className="flex border-t-2 border-gray-300 py-5">
                <div className="h-24 w-24 shrink-0 rounded-full bg-white mr-4 flex items-center justify-center relative overflow-hidden ring-4 ring-gray-100">
                  {/* Preview Frame on a dummy avatar */}
                  <div className="h-20 w-20 rounded-full bg-gray-200 absolute"></div>
                  <img src={item.img} alt={item.name} className="absolute h-32 w-32 object-contain z-10" style={{ pointerEvents: 'none' }} />
                </div>

                <section className="flex flex-col gap-3 z-0 pl-4">
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                  <button
                    onClick={() => handleBuy(item.id, item.price, item.name)}
                    disabled={ownedItems.has(item.id)}
                    className={`flex w-fit items-center gap-1 rounded-2xl border-b-4 px-10 py-3 text-sm font-bold uppercase transition active:translate-y-1 active:border-b-0
                      ${ownedItems.has(item.id)
                        ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200"}`}
                  >
                    {ownedItems.has(item.id)
                      ? "OWNED"
                      : item.price === "0"
                        ? "FREE"
                        : `BUY: ${item.price} NIHON`}
                  </button>
                </section>
              </div>
            ))}
          </div>

        </div>
        <RightBar />
      </div>
      <BottomBar selectedTab="Cửa hàng" />
    </div>
  );
};

export default Shop;
