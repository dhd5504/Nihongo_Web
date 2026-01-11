import React, { useState, useEffect } from "react";
import { FaCheck, FaForward, FaTimes } from "react-icons/fa";

interface WordPair {
  id: number;
  word: string;
  translation: string;
  language: string;
}

const MatchingPairsExercise = () => {
  const [progress, setProgress] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[][]>([]);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([]);
  const [shuffledTranslations, setShuffledTranslations] = useState<WordPair[]>([]);

  const wordPairs = [
    { id: 1, word: "Hello", translation: "Hola", language: "Spanish" },
    { id: 2, word: "Goodbye", translation: "Adiós", language: "Spanish" },
    { id: 3, word: "Thank you", translation: "Gracias", language: "Spanish" },
    { id: 4, word: "Please", translation: "Por favor", language: "Spanish" },
  ];

  useEffect(() => {
    // Shuffle words and translations independently

    const shuffleArray = (array: WordPair[]): WordPair[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const current = shuffled[i];
        const swapWith = shuffled[j];
        if (!current || !swapWith) {
          continue;
        }
        shuffled[i] = swapWith;
        shuffled[j] = current;
      }
      return shuffled;
    };

    setShuffledWords(shuffleArray(wordPairs));
    setShuffledTranslations(shuffleArray(wordPairs));
  }, []);

  const handleWordClick = (word: string) => {
    if (selectedWords.includes(word) || matchedPairs.flat().includes(word)) return;

    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);

    if (newSelected.length === 2) {
      checkMatch(newSelected);
    }
  };

  const checkMatch = (selected: string[]) => {
    const [first, second] = selected;
    const isPair = wordPairs.some(
      pair =>
        (pair.word === first && pair.translation === second) ||
        (pair.translation === first && pair.word === second)
    );

    if (isPair) {
      setMatchedPairs([...matchedPairs, selected]);
      setProgress((prevProgress) =>
        Math.min(100, prevProgress + 100 / wordPairs.length)
      );
      setError("");
    } else {
      setError("Incorrect match! Try again.");
      setTimeout(() => setError(""), 2000);
    }

    setSelectedWords([]);
  };

  const handleSkip = () => {
    setSelectedWords([]);
    setError("");
    setIsChecking(false);
  };

  const handleCheck = () => {
    setIsChecking(true);
    if (matchedPairs.length < wordPairs.length) {
      setError("Please match all pairs before checking!");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Match the words with their translations</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      <div className="flex space-x-8 mb-6">
        {/* Words Column */}
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Words</h3>
          {shuffledWords.map((pair, index) => (
            <button
              key={`word-${index}`}
              onClick={() => handleWordClick(pair.word)}
              className={`w-full p-4 rounded-lg text-center transition-all duration-200 ${
                selectedWords.includes(pair.word)
                  ? "bg-blue-500 text-white"
                  : matchedPairs.flat().includes(pair.word)
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              } ${matchedPairs.flat().includes(pair.word) ? "cursor-not-allowed" : "cursor-pointer"}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              disabled={matchedPairs.flat().includes(pair.word)}
              aria-label={`Select word: ${pair.word}`}
            >
              {pair.word}
            </button>
          ))}
        </div>

        {/* Translations Column */}
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Translations</h3>
          {shuffledTranslations.map((pair, index) => (
            <button
              key={`translation-${index}`}
              onClick={() => handleWordClick(pair.translation)}
              className={`w-full p-4 rounded-lg text-center transition-all duration-200 ${
                selectedWords.includes(pair.translation)
                  ? "bg-blue-500 text-white"
                  : matchedPairs.flat().includes(pair.translation)
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              } ${matchedPairs.flat().includes(pair.translation) ? "cursor-not-allowed" : "cursor-pointer"}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              disabled={matchedPairs.flat().includes(pair.translation)}
              aria-label={`Select translation: ${pair.translation}`}
            >
              {pair.translation}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="flex items-center">
            <FaTimes className="mr-2" />
            {error}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={handleSkip}
          className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          aria-label="Skip question"
        >
          <FaForward className="mr-2" />
          Skip
        </button>

        <button
          onClick={handleCheck}
          className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          aria-label="Check answers"
        >
          <FaCheck className="mr-2" />
          Check
        </button>
      </div>

      {isChecking && matchedPairs.length === wordPairs.length && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg" role="alert">
          <p className="font-semibold">Congratulations! You've matched all pairs correctly!</p>
        </div>
      )}
    </div>
  );
};

export default MatchingPairsExercise;
