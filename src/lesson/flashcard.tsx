import React, { useState, useRef, useEffect, FC } from "react";
import {
  FaPlus,
  FaTrash,
  FaRandom,
  FaPencilAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
} from "react-icons/fa";
import { SessionKey, SessionStorage } from "../utils/session-storage";
import { updateStatusLesson } from "~/db/queries";
import { useRouter } from "next/router";
import axios from "axios";
import { getIdUserByToken } from "~/utils/JWTService";
import { useParams } from "next/navigation";

interface FlashcardSetProps {
  initFlashCards: { id: number; word: string; meaning: string }[];
}

const FlashcardSet: FC<FlashcardSetProps> = (props) => {
  const [cards, setCards] = useState(props.initFlashCards);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWord, setEditedWord] = useState("");
  const [editedMeaning, setEditedMeaning] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const { lessonId } = useParams();

  const cardRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.focus();
    }
  }, [currentIndex]);

  const handleFlip = () => {
    if (!isEditing) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleAdd = () => {
    const newCard = {
      id: cards.length + 1,
      word: "New Word",
      meaning: "New Meaning",
    };
    setCards([...cards, newCard]);
  };

  const handleDelete = () => {
    if (cards.length > 1) {
      const newCards = cards.filter((_, index) => index !== currentIndex);
      setCards(newCards);
      setCurrentIndex(Math.min(currentIndex, newCards.length - 1));
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      const updatedCards = cards.map((card, index) =>
        index === currentIndex
          ? { ...card, word: editedWord, meaning: editedMeaning }
          : card,
      );
      setCards(updatedCards);
    } else {
      setEditedWord(cards[currentIndex]?.word || "");
      setEditedMeaning(cards[currentIndex]?.meaning || "");
    }
    setIsEditing(!isEditing);
  };

  const handleComplete = async () => {
    try {
      setIsCompleted(true);
      const userId = getIdUserByToken();
      await updateStatusLesson(Number(lessonId), Number(userId));
      SessionStorage.delete(SessionKey.LESSON_ID);
      return await router.push("/learn");
    } catch (error) {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === " ") {
      e.preventDefault();
      handleFlip();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800">Flashcards</h1>
          {!isCompleted && (
            <p className="text-gray-600">
              Card {currentIndex + 1} of {cards.length}
            </p>
          )}
        </div>

        {isCompleted ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <FaCheckCircle className="animate-bounce text-6xl text-green-500" />
            <h2 className="text-2xl font-bold text-green-600">
              Congratulations!
            </h2>
            <p className="text-gray-600">
              You have completed the flashcard set!
            </p>
          </div>
        ) : (
          <div
            ref={cardRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="relative mx-auto aspect-[3/2] w-full max-w-2xl"
            aria-label="Flashcard"
          >
            <div
              className={`preserve-3d h-full w-full transform-gpu cursor-pointer transition-transform duration-700 ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              onClick={handleFlip}
            >
              <div className="backface-hidden absolute flex h-full w-full items-center justify-center rounded-xl bg-white p-8 shadow-2xl">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedWord}
                    onChange={(e) => setEditedWord(e.target.value)}
                    className="w-full text-center text-4xl font-bold outline-none"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-4xl font-bold text-gray-800">
                    {cards[currentIndex]?.word}
                  </h2>
                )}
              </div>
              <div className="backface-hidden rotate-y-180 absolute flex h-full w-full items-center justify-center rounded-xl bg-white p-8 shadow-2xl">
                {isEditing ? (
                  <textarea
                    value={editedMeaning}
                    onChange={(e) => setEditedMeaning(e.target.value)}
                    className="h-full w-full resize-none text-center text-2xl outline-none"
                  />
                ) : (
                  <p className="text-2xl text-gray-600">
                    {cards[currentIndex]?.meaning}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isCompleted && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={handlePrevious}
              className="rounded-full bg-white p-3 shadow-md transition-shadow hover:shadow-lg"
              aria-label="Previous card"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <button
              onClick={handleEdit}
              className="rounded-full bg-white p-3 shadow-md transition-shadow hover:shadow-lg"
              aria-label="Edit card"
            >
              <FaPencilAlt className="text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-full bg-white p-3 shadow-md transition-shadow hover:shadow-lg"
              aria-label="Delete card"
            >
              <FaTrash className="text-gray-600" />
            </button>
            <button
              onClick={handleShuffle}
              className="rounded-full bg-white p-3 shadow-md transition-shadow hover:shadow-lg"
              aria-label="Shuffle cards"
            >
              <FaRandom className="text-gray-600" />
            </button>
            <button
              onClick={handleAdd}
              className="rounded-full bg-white p-3 shadow-md transition-shadow hover:shadow-lg"
              aria-label="Add new card"
            >
              <FaPlus className="text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              className="rounded-full bg-white p-3 shadow-md transition-shadow hover:shadow-lg"
              aria-label="Next card"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
            <button
              onClick={handleComplete}
              className="rounded-full bg-green-500 p-3 text-white shadow-md transition-all hover:bg-green-600 hover:shadow-lg"
              aria-label="Complete learning"
            >
              <FaCheckCircle className="text-xl" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default FlashcardSet;
