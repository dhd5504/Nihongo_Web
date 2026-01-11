import { jwtDecode } from "jwt-decode";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useState } from "react";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { SettingsRightNav } from "~/components/SettingsRightNav";
import { TopBar } from "~/components/TopBar";
import { getProfile, updateProfile } from "~/db/queries";
import { getIdUserByToken, manualParsedCoolies } from "~/utils/JWTService";
import { UserData } from "../profile";
import { useToast } from "~/context/toast";
import Fetching from "~/components/Fetching";
import { useRouter } from "next/router";
import React from "react";
import { useWalletStore } from "~/stores/useWalletStore";
import { getShopContract } from "~/utils/contracts";

const Account: NextPage<{
  profile: UserData;
}> = ({ profile }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }>({
    name: profile.name,
    phoneNumber: profile.phone,
    password: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string>(
    profile.avatar ?? "",
  );
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(
    profile.avatar ?? null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFrame, setSelectedFrame] = React.useState<number>(0);

  const { addToast } = useToast();

  React.useEffect(() => {
    const saved = localStorage.getItem("selectedFrame");
    if (saved) setSelectedFrame(Number(saved));
  }, []);

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setUploadedAvatarUrl(null);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    setUploadedAvatarUrl(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return uploadedAvatarUrl;

    const signatureResponse = await fetch("/api/cloudinary-sign", {
      method: "POST",
    });

    if (!signatureResponse.ok) {
      throw new Error("Unable to create Cloudinary signature");
    }

    const {
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    }: {
      signature: string;
      timestamp: number;
      cloudName: string;
      apiKey: string;
      folder?: string;
    } = await signatureResponse.json();

    const formData = new FormData();
    formData.append("file", avatarFile);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    if (folder) formData.append("folder", folder);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!uploadResponse.ok) {
      throw new Error("Upload avatar failed");
    }

    const result = (await uploadResponse.json()) as { secure_url?: string };

    if (!result.secure_url) {
      throw new Error("Missing secure URL from Cloudinary");
    }

    setUploadedAvatarUrl(result.secure_url);
    setAvatarPreview(result.secure_url);
    setAvatarFile(null);

    return result.secure_url;
  };

  const handleSave = async () => {
    if (form.password !== form.confirmPassword) {
      addToast("Confirm password and new password are not same", "error");
      return;
    }

    try {
      setLoading(true);

      const userId = getIdUserByToken();
      let avatarUrl = uploadedAvatarUrl;

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      await updateProfile({
        userId: Number(userId),
        ...form,
        avatar: avatarUrl ?? "",
      });
      addToast("success", "success");
      await router.push("/profile");
    } catch (error) {
      addToast(String(error), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Fetching />}
      <TopBar />
      <LeftBar selectedTab={null} />
      <BottomBar selectedTab={null} />
      <div className="mx-auto flex flex-col gap-5 px-4 py-20 sm:py-10 md:pl-28 lg:pl-72">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between lg:max-w-4xl">
          <h1 className="text-lg font-bold text-gray-800 sm:text-2xl">
            Tài khoản
          </h1>
          <button
            className="rounded-2xl border-b-4 border-green-600 bg-green-500 px-5 py-3 font-bold uppercase text-white transition hover:brightness-110 disabled:border-b-0 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:brightness-100"
            onClick={() => {
              handleSave();
            }}
            type="button"
            disabled={loading || form.name === "" || form.phoneNumber === ""}
          >
            Lưu
          </button>
        </div>
        <div className="flex justify-center gap-12">
          <div className="flex w-full max-w-xl flex-col gap-8">
            <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-10 sm:pl-10">
              <div className="font-bold sm:w-2/6">Avatar</div>
              <div className="flex grow flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-200 bg-gray-50 text-2xl font-bold text-gray-400">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (profile.name.charAt(0) || "?").toUpperCase()
                  )}
                  {selectedFrame > 0 && (
                    <img
                      src={`/avatar-frames/frame-${selectedFrame}.svg`}
                      alt="Selected frame"
                      className="pointer-events-none absolute -left-2 -top-2 h-24 w-24 max-w-none"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-2xl border-2 border-gray-200 px-4 py-2 font-semibold transition hover:bg-gray-50"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      Choose image
                    </button>
                    <button
                      className="rounded-2xl border-2 border-gray-200 px-4 py-2 font-semibold text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={handleRemoveAvatar}
                      type="button"
                      disabled={!avatarPreview && !avatarFile}
                    >
                      Remove
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    New photo uploads to Cloudinary when you click Save.
                  </span>
                  {avatarFile && (
                    <span className="text-xs font-semibold text-amber-600">
                      New avatar ready to upload
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-10 sm:pl-10">
              <div className="font-bold sm:w-2/6">Name</div>
              <input
                className="grow rounded-2xl border-2 border-gray-200 p-4 py-2"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-10 sm:pl-10">
              <div className="font-bold sm:w-2/6">Phone</div>
              <input
                className="grow rounded-2xl border-2 border-gray-200 p-4 py-2"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-10 sm:pl-10">
              <div className="font-bold sm:w-2/6">New Password</div>
              <input
                className="grow rounded-2xl border-2 border-gray-200 p-4 py-2"
                value={form.password}
                placeholder="Mật khẩu "
                type="password"
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-10 sm:pl-10">
              <div className="font-bold sm:w-2/6">Confirm Password</div>
              <input
                className="grow rounded-2xl border-2 border-gray-200 p-4 py-2"
                value={form.confirmPassword}
                placeholder="Mật khẩu "
                type="password"
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
            {/* Avatar Frames Selection */}
            <div className="border-t-2 border-gray-100 pt-10 mt-5">
              <h2 className="mb-5 text-xl font-bold">Avatar Frames</h2>
              <AvatarFramesSelector
                selectedFrame={selectedFrame}
                onSelectFrame={setSelectedFrame}
              />
            </div>

          </div>
          <SettingsRightNav selectedTab="Tài khoản" />
        </div>
      </div>
    </div>
  );
};

const AvatarFramesSelector = ({
  selectedFrame,
  onSelectFrame,
}: {
  selectedFrame: number;
  onSelectFrame: (id: number) => void;
}) => {
  const { walletAddress, provider } = useWalletStore();
  const [ownedItems, setOwnedItems] = React.useState<Set<number>>(new Set([1]));

  const ITEMS = [
    { id: 1, name: "Frame 1", img: "/avatar-frames/frame-1.svg" },
    { id: 2, name: "Frame 2", img: "/avatar-frames/frame-2.svg" },
    { id: 3, name: "Frame 3", img: "/avatar-frames/frame-3.svg" },
    { id: 4, name: "Frame 4", img: "/avatar-frames/frame-4.svg" },
  ];

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
        console.error(err);
      }
    };
    checkOwnership();
  }, [walletAddress, provider]);

  const handleSelect = (id: number) => {
    if (id > 1 && !ownedItems.has(id)) return;
    onSelectFrame(id);
    if (id === 0) {
      localStorage.removeItem("selectedFrame");
    } else {
      localStorage.setItem("selectedFrame", String(id));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* None Option */}
      <div
        onClick={() => handleSelect(0)}
        className={`cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center gap-2 transition hover:bg-gray-50
                    ${selectedFrame === 0 ? "border-green-500 bg-green-50" : "border-gray-200"}`}
      >
        <div className="h-16 w-16 rounded-full bg-gray-200"></div>
        <span className="text-sm font-bold">None</span>
      </div>

      {ITEMS.map(item => (
        <div
          key={item.id}
          onClick={() => handleSelect(item.id)}
          className={`relative rounded-xl border-2 p-2 flex flex-col items-center gap-2 transition 
                        ${selectedFrame === item.id ? "border-green-500 bg-green-50" : "border-gray-200"}
                        ${item.id !== 1 && !ownedItems.has(item.id) ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer hover:bg-gray-50"}
                    `}
        >
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-gray-200"></div>
            <img src={item.img} className="absolute -left-2 -top-2 h-20 w-20 max-w-none" />
          </div>
          <span className="text-sm font-bold">{item.name}</span>
          {item.id === 1 ? (
            <span className="text-xs font-bold text-green-600">FREE</span>
          ) : !ownedItems.has(item.id) ? (
            <span className="text-xs text-red-500 font-bold">LOCKED</span>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default Account;

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

  return {
    props: { profile },
  };
}
