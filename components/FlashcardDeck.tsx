"use client";

import { useState } from "react";
import {
  Flashcard as FlashcardType,
  ConfidenceLevel,
  SRS_INTERVALS,
} from "@/types/flashcard";
import { Flashcard } from "./Flashcard";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

interface FlashcardDeckProps {
  cards: FlashcardType[];
  onComplete: (stats: { correct: number; wrong: number }) => void;
}

export function FlashcardDeck({ cards, onComplete }: FlashcardDeckProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  if (!cards || cards.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-garden-earth/70">
            No cards to review right now!
          </p>
          <p className="text-sm text-garden-earth/60 mt-2">
            Complete some lessons or come back later for your next review.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const updateCardProgress = async (
    confidence: ConfidenceLevel,
    correct: boolean
  ) => {
    if (!user) return;

    try {
      // Calculate next review date based on confidence
      const daysToAdd = SRS_INTERVALS[confidence];
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

      // Update the learned_words table
      const { error } = await supabase
        .from("learned_words")
        .update({
          confidence_level: confidence,
          next_review_date: nextReviewDate.toISOString(),
          last_seen: new Date().toISOString(),
          correct_count: correct
            ? currentCard.correctCount + 1
            : currentCard.correctCount,
          wrong_count: !correct
            ? currentCard.wrongCount + 1
            : currentCard.wrongCount,
        })
        .eq("user_id", user.id)
        .eq("word_id", currentCard.wordId);

      if (error) {
        console.error("Error updating card progress:", error);
      }
    } catch (error) {
      console.error("Error updating card progress:", error);
    }
  };

  const handleResponse = async (confidence: ConfidenceLevel) => {
    const correct = confidence >= 2; // Medium or higher is considered correct
    await updateCardProgress(confidence, correct);

    // Update stats
    setStats({
      correct: stats.correct + (correct ? 1 : 0),
      wrong: stats.wrong + (correct ? 0 : 1),
    });

    // Move to next card or complete
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      onComplete({
        correct: stats.correct + (correct ? 1 : 0),
        wrong: stats.wrong + (correct ? 0 : 1),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between text-sm text-garden-earth/60 mb-2">
          <span>Progress</span>
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <div className="w-full bg-garden-earth/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-garden-pink h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✓</span>
          <span className="text-garden-leaf font-semibold">
            {stats.correct}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">✗</span>
          <span className="text-red-500 font-semibold">{stats.wrong}</span>
        </div>
      </div>

      {/* Flashcard */}
      <Flashcard card={currentCard} onFlip={() => setIsFlipped(true)} />

      {/* Response Buttons */}
      {isFlipped && (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              How well did you know this?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => handleResponse(1)}
                variant="outline"
                className="flex-col h-auto py-4 gap-2 border-red-300 hover:bg-red-50"
              >
                <span className="text-2xl">😓</span>
                <span className="text-xs">Hard</span>
                <span className="text-[10px] text-garden-earth/50">
                  1 day
                </span>
              </Button>
              <Button
                onClick={() => handleResponse(2)}
                variant="outline"
                className="flex-col h-auto py-4 gap-2 border-yellow-300 hover:bg-yellow-50"
              >
                <span className="text-2xl">🤔</span>
                <span className="text-xs">Medium</span>
                <span className="text-[10px] text-garden-earth/50">
                  3 days
                </span>
              </Button>
              <Button
                onClick={() => handleResponse(3)}
                variant="outline"
                className="flex-col h-auto py-4 gap-2 border-green-300 hover:bg-green-50"
              >
                <span className="text-2xl">😊</span>
                <span className="text-xs">Good</span>
                <span className="text-[10px] text-garden-earth/50">
                  7 days
                </span>
              </Button>
              <Button
                onClick={() => handleResponse(4)}
                variant="outline"
                className="flex-col h-auto py-4 gap-2 border-blue-300 hover:bg-blue-50"
              >
                <span className="text-2xl">🎉</span>
                <span className="text-xs">Easy</span>
                <span className="text-[10px] text-garden-earth/50">
                  14 days
                </span>
              </Button>
            </div>
            <p className="text-xs text-center text-garden-earth/60 mt-4">
              Your choice determines when you'll see this card again
            </p>
          </CardContent>
        </Card>
      )}

      {!isFlipped && (
        <div className="text-center text-sm text-garden-earth/50">
          Click the card to reveal the answer
        </div>
      )}
    </div>
  );
}
