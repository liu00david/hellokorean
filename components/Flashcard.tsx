"use client";

import { Flashcard as FlashcardType } from "@/types/flashcard";
import { Card, CardContent } from "./ui/card";
import { useState } from "react";

interface FlashcardProps {
  card: FlashcardType;
  onFlip?: () => void;
}

export function Flashcard({ card, onFlip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const question =
    card.direction === "korean-to-english" ? card.word : card.english;
  const answer =
    card.direction === "korean-to-english" ? card.english : card.word;

  return (
    <div className="perspective-1000 w-full max-w-lg mx-auto">
      <div
        className={`relative w-full h-96 transition-transform duration-500 transform-style-3d cursor-pointer ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={handleFlip}
      >
        {/* Front of card */}
        <Card
          className={`absolute w-full h-full backface-hidden ${
            isFlipped ? "invisible" : "visible"
          }`}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center space-y-4">
              <div className="text-sm text-garden-earth/60 mb-4">
                {card.direction === "korean-to-english"
                  ? "Korean → English"
                  : "English → Korean"}
              </div>
              <div
                className={`${
                  card.direction === "korean-to-english"
                    ? "text-5xl font-noto"
                    : "text-4xl"
                } font-bold text-garden-earth mb-4`}
              >
                {question}
              </div>
              {card.direction === "korean-to-english" && (
                <div className="text-xl text-garden-earth/60">
                  {card.romanization}
                </div>
              )}
              <div className="mt-8 text-sm text-garden-earth/50">
                Click to reveal
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className={`absolute w-full h-full backface-hidden rotate-y-180 ${
            isFlipped ? "visible" : "invisible"
          }`}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center space-y-6">
              <div className="text-4xl mb-2">✓</div>
              <div
                className={`${
                  card.direction === "english-to-korean"
                    ? "text-5xl font-noto"
                    : "text-4xl"
                } font-bold text-garden-leaf mb-4`}
              >
                {answer}
              </div>
              {card.direction === "english-to-korean" && (
                <div className="text-xl text-garden-earth/60">
                  {card.romanization}
                </div>
              )}
              {card.examples && card.examples.length > 0 && (
                <div className="mt-6 p-4 bg-garden-mint/10 rounded-xl">
                  <div className="text-sm text-garden-earth/70 mb-2">
                    Example:
                  </div>
                  <div className="font-noto text-garden-earth mb-1">
                    {card.examples[0].korean}
                  </div>
                  <div className="text-sm text-garden-earth/60">
                    {card.examples[0].english}
                  </div>
                </div>
              )}
              <div className="text-xs text-garden-earth/50">
                <span className="inline-block px-2 py-1 bg-garden-lavender/30 rounded">
                  {card.type}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence indicator */}
      <div className="mt-4 text-center text-sm text-garden-earth/60">
        <div className="flex items-center justify-center gap-2">
          <span>Confidence:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= card.confidenceLevel
                    ? "bg-garden-leaf"
                    : "bg-garden-earth/20"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-1 text-xs">
          {card.correctCount} correct · {card.wrongCount} wrong
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
