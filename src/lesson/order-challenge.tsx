"use client";

import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";

type OrderChallengeProps = {
    words: string[];
    correctOrder: string;
    onComplete: (isCorrect: boolean) => void;
    disabled?: boolean;
    status: "correct" | "wrong" | "none";
};

export const OrderChallenge = ({
    words,
    correctOrder,
    onComplete,
    disabled,
    status,
}: OrderChallengeProps) => {
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>(words);

    const onWordClick = (word: string, index: number) => {
        if (disabled || status !== "none") return;

        const newSelected = [...selectedWords, word];
        setSelectedWords(newSelected);
        setAvailableWords(availableWords.filter((_, i) => i !== index));

        // Check if sentence is complete and correct
        // Usually we check completion on "Check" button click in Footer,
        // but we can also signal completeness here.
    };

    const onRemoveWord = (index: number) => {
        if (disabled || status !== "none") return;

        const word = selectedWords[index];
        if (word !== undefined) {
            setAvailableWords([...availableWords, word]);
            setSelectedWords(selectedWords.filter((_, i) => i !== index));
        }
    };

    useEffect(() => {
        const currentSentence = selectedWords.join("");
        // We normalize spaces for comparison if needed
        const isMatched = currentSentence === correctOrder.replace(/\s/g, "");
        if (selectedWords.length > 0) {
            onComplete(isMatched);
        } else {
            onComplete(false);
        }
    }, [selectedWords, correctOrder, onComplete]);

    return (
        <div className="flex flex-col gap-y-8 w-full">
            {/* Selection Area */}
            <div className="min-h-[100px] w-full border-b-2 border-dashed border-gray-300 py-4 flex flex-wrap gap-2">
                {selectedWords.map((word, i) => (
                    <button
                        key={`${word}-${i}`}
                        onClick={() => onRemoveWord(i)}
                        disabled={disabled}
                        className={cn(
                            "rounded-xl border-2 border-b-4 border-gray-200 px-4 py-2 font-bold text-gray-700 transition-all hover:bg-gray-100 active:border-b-2",
                            status === "correct" && "border-green-500 bg-green-100 text-green-700",
                            status === "wrong" && "border-red-500 bg-red-100 text-red-700"
                        )}
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* Available Words Area */}
            <div className="flex flex-wrap justify-center gap-3">
                {availableWords.map((word, i) => (
                    <button
                        key={`${word}-${i}`}
                        onClick={() => onWordClick(word, i)}
                        disabled={disabled}
                        className="rounded-xl border-2 border-b-4 border-gray-200 px-5 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50 active:border-b-2 disabled:opacity-50"
                    >
                        {word}
                    </button>
                ))}
            </div>
        </div>
    );
};
