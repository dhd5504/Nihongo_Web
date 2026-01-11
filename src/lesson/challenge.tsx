import { cn } from "~/lib/utils";

import { Card } from "./card";

type ChallengeOption = {
  id: number;
  option: string;
  isCorrect: boolean;
  imageSrc?: string | null;
  audioSrc?: string | null;
};

type ChallengeProps = {
  options: ChallengeOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  type: string;
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
}: ChallengeProps) => {
  return (
    <div
      className={cn(
        "grid gap-2",
        type === "ASSIST" && "grid-cols-1",
        type === "SELECT" &&
          "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
      )}
    >
      {options.map((option, i) => (
        <Card
          key={option.id}
          id={Number(option.id)} // Ensure id is a number
          text={option.option}
          imageSrc={option.imageSrc}
          shortcut={`${i + 1}`}
          selected={selectedOption === option.id}
          onClick={() => onSelect(option.id)}
          status={status}
          audioSrc={option.audioSrc}
          disabled={disabled}
          type={type}
        />
      ))}
    </div>
  );
};
