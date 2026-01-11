"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "~/lib/utils";

type Pair = {
    id: number;
    japanese: string;
    vietnamese: string;
};

type PairMatchingProps = {
    pairs: Pair[];
    onComplete: () => void;
    disabled?: boolean;
};

export const PairMatching = ({
    pairs,
    onComplete,
    disabled
}: PairMatchingProps) => {
    const [selectedJapanese, setSelectedJapanese] = useState<number | null>(null);
    const [selectedVietnamese, setSelectedVietnamese] = useState<number | null>(null);
    const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
    const [errorIds, setErrorIds] = useState<Set<string>>(new Set());

    // Shuffle the right column (Vietnamese) once on mount
    const shuffledVietnamese = useMemo(() => {
        return [...pairs].sort(() => Math.random() - 0.5);
    }, [pairs]);

    useEffect(() => {
        if (selectedJapanese !== null && selectedVietnamese !== null) {
            if (selectedJapanese === selectedVietnamese) {
                // Match found
                setMatchedIds((prev) => new Set([...prev, selectedJapanese]));
                setSelectedJapanese(null);
                setSelectedVietnamese(null);
            } else {
                // Wrong match
                const errorKey = `${selectedJapanese}-${selectedVietnamese}`;
                setErrorIds(new Set([errorKey]));

                setTimeout(() => {
                    setErrorIds(new Set());
                    setSelectedJapanese(null);
                    setSelectedVietnamese(null);
                }, 1000);
            }
        }
    }, [selectedJapanese, selectedVietnamese]);

    useEffect(() => {
        if (matchedIds.size === pairs.length && pairs.length > 0) {
            onComplete();
        }
    }, [matchedIds, pairs.length, onComplete]);

    return (
        <div className="flex w-full flex-col gap-y-10">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {/* Japanese Column */}
                <div className="flex flex-col gap-y-4">
                    <h3 className="mb-2 text-center text-sm font-bold uppercase tracking-wide text-neutral-400">Tiếng Nhật</h3>
                    {pairs.map((pair) => {
                        const isMatched = matchedIds.has(pair.id);
                        const isSelected = selectedJapanese === pair.id;
                        const hasError = Array.from(errorIds).some(key => key.startsWith(`${pair.id}-`));

                        return (
                            <button
                                key={`ja-${pair.id}`}
                                disabled={disabled || isMatched}
                                onClick={() => setSelectedJapanese(pair.id)}
                                className={cn(
                                    "relative h-16 w-full rounded-xl border-2 border-b-4 p-4 text-center text-lg font-bold transition active:border-b-2",
                                    "border-neutral-200 text-neutral-700 hover:bg-neutral-100",
                                    isSelected && "border-sky-300 bg-sky-100 text-sky-500 hover:bg-sky-100",
                                    isMatched && "pointer-events-none border-transparent bg-green-100 text-green-500 opacity-50",
                                    hasError && "animate-shake border-rose-300 bg-rose-100 text-rose-500"
                                )}
                            >
                                {pair.japanese}
                            </button>
                        );
                    })}
                </div>

                {/* Vietnamese Column */}
                <div className="flex flex-col gap-y-4">
                    <h3 className="mb-2 text-center text-sm font-bold uppercase tracking-wide text-neutral-400">Tiếng Việt</h3>
                    {shuffledVietnamese.map((pair) => {
                        const isMatched = matchedIds.has(pair.id);
                        const isSelected = selectedVietnamese === pair.id;
                        const hasError = Array.from(errorIds).some(key => key.endsWith(`-${pair.id}`));

                        return (
                            <button
                                key={`vn-${pair.id}`}
                                disabled={disabled || isMatched}
                                onClick={() => setSelectedVietnamese(pair.id)}
                                className={cn(
                                    "relative h-16 w-full rounded-xl border-2 border-b-4 p-4 text-center text-lg font-bold transition active:border-b-2",
                                    "border-neutral-200 text-neutral-700 hover:bg-neutral-100",
                                    isSelected && "border-sky-300 bg-sky-100 text-sky-500 hover:bg-sky-100",
                                    isMatched && "pointer-events-none border-transparent bg-green-100 text-green-500 opacity-50",
                                    hasError && "animate-shake border-rose-300 bg-rose-100 text-rose-500"
                                )}
                            >
                                {pair.vietnamese}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
