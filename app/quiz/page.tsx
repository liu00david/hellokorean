"use client";

import { useState, useEffect } from "react";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type QuizState = "setup" | "quiz" | "results";

export default function QuizPage() {
  const { user } = useAuth();
  const [state, setState] = useState<QuizState>("setup");
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<
    { question: string; selected: string; correct: string; isCorrect: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const startQuiz = async (count: number = 10) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/generate-quiz?count=${count}`);
      const data = await response.json();

      if (data.questions) {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswers([]);
        setState("quiz");
      } else {
        alert("Failed to generate quiz: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Failed to start quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];

    // Record the answer
    setAnswers([
      ...answers,
      {
        question: currentQuestion.question,
        selected: selectedAnswer,
        correct: currentQuestion.answer,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz complete
      saveQuizResults(score, questions.length);
      setState("results");
    }
  };

  const saveQuizResults = async (finalScore: number, total: number) => {
    if (!user) return;

    try {
      const percentage = Math.round((finalScore / total) * 100);

      await supabase.from("quiz_results").insert({
        user_id: user.id,
        quiz_id: `quiz-${Date.now()}`,
        score: percentage,
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const resetQuiz = () => {
    setState("setup");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
  };

  if (state === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">✏️</div>
            <h1 className="text-5xl font-bold mb-4 text-garden-earth">
              Quiz Center
            </h1>
            <p className="text-xl text-garden-earth/70 mb-8">
              Test your Korean knowledge with auto-generated quizzes
            </p>

            <Card>
              <CardContent className="pt-6">
                <p className="text-garden-earth/70 mb-6">
                  Choose how many questions you'd like:
                </p>
                <div className="grid gap-4">
                  <Button
                    onClick={() => startQuiz(5)}
                    disabled={loading}
                    variant="outline"
                    className="py-6"
                  >
                    Quick Quiz (5 questions)
                  </Button>
                  <Button
                    onClick={() => startQuiz(10)}
                    disabled={loading}
                    variant="default"
                    className="py-6"
                  >
                    Standard Quiz (10 questions)
                  </Button>
                  <Button
                    onClick={() => startQuiz(20)}
                    disabled={loading}
                    variant="secondary"
                    className="py-6"
                  >
                    Challenge Quiz (20 questions)
                  </Button>
                </div>

                {!user && (
                  <p className="mt-6 text-sm text-garden-earth/60">
                    💡 Sign in to save your quiz results!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (state === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
        <div className="container mx-auto px-4 py-12">
          <QuizResults
            score={score}
            totalQuestions={questions.length}
            onRetry={resetQuiz}
          />
        </div>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
      <div className="container mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex justify-between text-sm text-garden-earth/60 mb-2">
            <span>Progress</span>
            <span>
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-garden-earth/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-garden-pink h-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Current Question */}
        <QuizQuestion
          key={currentQuestionIndex} // Force re-render on question change
          question={questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
