"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRetry: () => void;
}

export function QuizResults({ score, totalQuestions, onRetry }: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { emoji: "🎉", message: "Outstanding!", color: "text-garden-leaf" };
    if (percentage >= 70) return { emoji: "😊", message: "Great job!", color: "text-garden-leaf" };
    if (percentage >= 50) return { emoji: "👍", message: "Good effort!", color: "text-yellow-600" };
    return { emoji: "💪", message: "Keep practicing!", color: "text-orange-600" };
  };

  const grade = getGrade();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-4xl mb-4">
          Quiz Complete!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          {/* Score Display */}
          <div className="text-6xl md:text-8xl mb-4">{grade.emoji}</div>

          <div>
            <p className={`text-3xl font-bold ${grade.color} mb-2`}>
              {grade.message}
            </p>
            <p className="text-5xl font-bold text-garden-earth">
              {score} / {totalQuestions}
            </p>
            <p className="text-xl text-garden-earth/60 mt-2">
              {percentage}% correct
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-garden-earth/10 rounded-full h-4 overflow-hidden">
            <div
              className="bg-garden-leaf h-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center mt-8">
            <Button onClick={onRetry} variant="default" className="gap-2 w-full md:w-auto">
              🔄 Try Again
            </Button>
            <Link href="/lessons" className="w-full md:w-auto">
              <Button variant="outline" className="gap-2 w-full">
                📚 Back to Lessons
              </Button>
            </Link>
            <Link href="/profile" className="w-full md:w-auto">
              <Button variant="secondary" className="gap-2 w-full">
                👤 View Profile
              </Button>
            </Link>
          </div>

          {/* Encouragement */}
          <div className="mt-8 p-4 bg-garden-mint/10 rounded-xl">
            <p className="text-sm text-garden-earth/70">
              {percentage >= 70
                ? "You're making great progress! Keep up the excellent work! 🌸"
                : "Practice makes perfect! Review the lessons and try again. 화이팅! 💪"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
