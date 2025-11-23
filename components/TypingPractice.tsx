"use client";

import { useState, useEffect, useRef } from "react";
import { DictionaryEntry } from "@/types/dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TypingPracticeProps {
  words: DictionaryEntry[];
  onComplete: (stats: { correct: number; wrong: number }) => void;
}

export function TypingPractice({ words, onComplete }: TypingPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  useEffect(() => {
    // Focus input when component mounts or question changes
    inputRef.current?.focus();
  }, [currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || !userInput.trim()) return;

    const correct = userInput.trim() === currentWord.word;
    setIsCorrect(correct);
    setHasAnswered(true);

    setStats({
      correct: stats.correct + (correct ? 1 : 0),
      wrong: stats.wrong + (correct ? 0 : 1),
    });
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setHasAnswered(false);
      setIsCorrect(false);
    } else {
      onComplete({
        correct: stats.correct,
        wrong: stats.wrong,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasAnswered) {
      handleNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between text-sm text-garden-earth/60 mb-2">
          <span>Progress</span>
          <span>
            {currentIndex + 1} / {words.length}
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

      {/* Question Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-garden-earth/60">
              Question {currentIndex + 1} of {words.length}
            </span>
            <span className="text-xs bg-garden-lavender/50 px-2 py-1 rounded-lg">
              {currentWord.type}
            </span>
          </div>
          <CardTitle className="text-center text-3xl mb-4">
            {currentWord.english}
          </CardTitle>
          <p className="text-center text-sm text-garden-earth/60">
            Type the Korean translation
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={hasAnswered}
                placeholder="Type Korean here..."
                className={`text-2xl font-noto text-center py-6 ${
                  hasAnswered
                    ? isCorrect
                      ? "border-garden-leaf bg-green-50"
                      : "border-red-500 bg-red-50"
                    : ""
                }`}
                autoComplete="off"
                autoFocus
              />
            </div>

            {!hasAnswered && (
              <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={!userInput.trim()}
              >
                Check Answer
              </Button>
            )}
          </form>

          {hasAnswered && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-garden-mint/10 rounded-xl">
                {isCorrect ? (
                  <div className="text-center">
                    <div className="text-4xl mb-2">✓</div>
                    <p className="text-lg font-semibold text-garden-leaf">
                      Correct!
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">✗</div>
                    <p className="text-lg font-semibold text-red-500 mb-2">
                      Incorrect
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-garden-earth/70">
                        You typed:{" "}
                        <span className="font-bold font-noto text-red-600">
                          {userInput}
                        </span>
                      </p>
                      <p className="text-sm text-garden-earth/70">
                        Correct answer:{" "}
                        <span className="font-bold font-noto text-garden-leaf">
                          {currentWord.word}
                        </span>
                      </p>
                      <p className="text-xs text-garden-earth/60">
                        ({currentWord.romanization})
                      </p>
                    </div>
                  </div>
                )}

                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-garden-earth/10">
                    <div className="text-xs text-garden-earth/60 mb-2">
                      Example:
                    </div>
                    <div className="text-sm font-noto text-garden-earth mb-1">
                      {currentWord.examples[0].korean}
                    </div>
                    <div className="text-xs text-garden-earth/60">
                      {currentWord.examples[0].english}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleNext}
                className="w-full py-6 text-lg"
                variant="default"
              >
                {currentIndex === words.length - 1
                  ? "See Results →"
                  : "Next Word →"}
              </Button>
            </div>
          )}

          {!hasAnswered && (
            <div className="mt-4 text-center text-xs text-garden-earth/50">
              💡 Make sure your Korean keyboard is enabled
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
