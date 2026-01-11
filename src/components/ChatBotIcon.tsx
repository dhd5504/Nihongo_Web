import type { ComponentProps } from "react";

export const ChatBotIcon = (props: ComponentProps<"svg">) => {
  return (
    <svg viewBox="0 0 46 46" fill="none" {...props}>
      <rect x="8" y="10" width="30" height="22" rx="6" fill="#4ade80" />
      <rect x="13" y="15" width="20" height="12" rx="4" fill="white" />
      <circle cx="18" cy="21" r="2" fill="#4ade80" />
      <circle cx="28" cy="21" r="2" fill="#4ade80" />
      <rect x="20" y="26" width="6" height="1.5" rx="0.75" fill="#4ade80" />
      <path
        d="M22 7.5C22 6.67157 22.6716 6 23.5 6C24.3284 6 25 6.67157 25 7.5V10"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 33L10 36.5"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M34 33L36 36.5"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

