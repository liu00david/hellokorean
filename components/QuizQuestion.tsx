"use client";

import { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedAnswer: string, isCorrect: boolean) => void;
  onNext?: () => void;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleAnswer = (answer: string) => {
    if (hasAnswered) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);

    const isCorrect = answer === question.answer;
    onAnswer(answer, isCorrect);
  };

  const getButtonVariant = (option: string) => {
    if (!hasAnswered) return "outline";
    if (option === question.answer) return "default"; // Correct answer (green)
    if (option === selectedAnswer) return "destructive"; // Wrong answer (red)
    return "outline";
  };

  const getButtonClassName = (option: string) => {
    if (!hasAnswered) return "";
    if (option === question.answer)
      return "bg-garden-leaf hover:bg-garden-leaf border-garden-leaf text-white";
    if (option === selectedAnswer)
      return "bg-red-500 hover:bg-red-500 border-red-500 text-white";
    return "opacity-50";
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-garden-earth/60">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs bg-garden-lavender/50 px-2 py-1 rounded-lg">
            {question.type === "vocab" ? "Vocabulary" : "Sentence"}
          </span>
        </div>
        <CardTitle className="text-center text-3xl font-noto mb-4">
          {question.question}
        </CardTitle>
        {question.direction && (
          <p className="text-center text-sm text-garden-earth/60">
            {question.direction === "korean-to-english"
              ? "Choose the English meaning"
              : "Choose the Korean translation"}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={getButtonVariant(option)}
              className={`w-full py-6 text-lg font-noto justify-start ${getButtonClassName(
                option
              )}`}
              onClick={() => handleAnswer(option)}
              disabled={hasAnswered}
            >
              <span className="mr-4 font-bold text-garden-earth/40">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </Button>
          ))}
        </div>

        {hasAnswered && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-garden-mint/10 rounded-xl">
              {selectedAnswer === question.answer ? (
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
                  <p className="text-sm text-garden-earth/70">
                    The correct answer is:{" "}
                    <span className="font-bold font-noto">{question.answer}</span>
                  </p>
                </div>
              )}
            </div>

            {onNext && (
              <Button
                onClick={onNext}
                className="w-full py-6 text-lg"
                variant="default"
              >
                {questionNumber === totalQuestions
                  ? "See Results →"
                  : "Next Question →"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
