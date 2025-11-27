"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizResults } from "@/components/QuizResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { getAllLessons } from "@/lib/lessons";
import { Lesson } from "@/types/lesson";

type QuizState = "setup" | "quiz" | "results";

function QuizPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const lessonIdFromUrl = searchParams.get("lessonId");

  const [state, setState] = useState<QuizState>("setup");
  const [currentQuizId, setCurrentQuizId] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<
    { question: string; selected: string; correct: string; isCorrect: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonQuizzes, setCompletedLessonQuizzes] = useState<Set<string>>(new Set());
  const [showRomanization, setShowRomanization] = useState(false);

  useEffect(() => {
    loadLessons();
    if (user) {
      loadCompletedLessonQuizzes();
    }
  }, [user]);

  // Auto-start quiz if lessonId is provided in URL
  useEffect(() => {
    if (lessonIdFromUrl && state === "setup" && !loading) {
      // Auto-start with 10 questions from the specific lesson
      startQuiz(10, "all", lessonIdFromUrl);
    }
  }, [lessonIdFromUrl, state]);

  const loadLessons = async () => {
    const lessonsData = await getAllLessons();
    setLessons(lessonsData);
  };

  const loadCompletedLessonQuizzes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("quiz_id")
        .eq("user_id", user.id)
        .like("quiz_id", "lesson-%");

      if (!error && data) {
        // Extract lesson IDs from quiz_ids (format: lesson-1.0-timestamp)
        const lessonIds = data
          .map((result) => {
            const match = result.quiz_id.match(/^lesson-([^-]+)/);
            return match ? match[1] : null;
          })
          .filter(Boolean) as string[];
        setCompletedLessonQuizzes(new Set(lessonIds));
      }
    } catch (error) {
      console.error("Error loading completed lesson quizzes:", error);
    }
  };

  const startQuiz = async (count: number, source: "learned" | "all", lessonId?: string) => {
    setLoading(true);
    try {
      const userId = user?.id || "";
      let url = `/api/generate-quiz?count=${count}&source=${source}&userId=${userId}`;

      if (lessonId) {
        url += `&lessonId=${lessonId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.questions) {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswers([]);

        // Set quiz ID for saving results later
        const quizId = lessonId
          ? `lesson-${lessonId}-${Date.now()}`
          : `${source}-${Date.now()}`;
        setCurrentQuizId(quizId);

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
        quiz_id: currentQuizId,
        score: percentage,
      });

      // Reload completed lesson quizzes if this was a lesson quiz
      if (currentQuizId.startsWith("lesson-")) {
        await loadCompletedLessonQuizzes();
      }
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
    setCurrentQuizId("");
  };

  if (state === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">✏️</div>
              <h1 className="text-5xl font-bold mb-4 text-garden-earth">
                Quiz Center
              </h1>
              <p className="text-xl text-garden-earth/70">
                Test your Korean knowledge with auto-generated quizzes
              </p>
            </div>

            <div className="space-y-8">
              {/* Learned Words Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    Learned Words
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center">
                      Please sign in to quiz yourself on learned words
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => startQuiz(5, "learned")}
                        disabled={loading}
                        variant="outline"
                        className="py-6"
                      >
                        5 Questions
                      </Button>
                      <Button
                        onClick={() => startQuiz(10, "learned")}
                        disabled={loading}
                        variant="outline"
                        className="py-6"
                      >
                        10 Questions
                      </Button>
                      <Button
                        onClick={() => startQuiz(20, "learned")}
                        disabled={loading}
                        variant="outline"
                        className="py-6"
                      >
                        20 Questions
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Words Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    All Words
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => startQuiz(5, "all")}
                      disabled={loading}
                      variant="outline"
                      className="py-6"
                    >
                      5 Questions
                    </Button>
                    <Button
                      onClick={() => startQuiz(10, "all")}
                      disabled={loading}
                      variant="outline"
                      className="py-6"
                    >
                      10 Questions
                    </Button>
                    <Button
                      onClick={() => startQuiz(20, "all")}
                      disabled={loading}
                      variant="outline"
                      className="py-6"
                    >
                      20 Questions
                    </Button>
                  </div>
                  {!user && (
                    <p className="mt-4 text-sm text-garden-earth/60 text-center">
                      💡 Sign in to save your quiz results!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* By Lesson Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Quiz by Lesson
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lessons.map((lesson) => {
                      const isCompleted = completedLessonQuizzes.has(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            isCompleted
                              ? "bg-green-50 border-green-300"
                              : "bg-white/50 border-garden-earth/10"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-garden-earth flex items-center gap-2">
                              Lesson {lesson.id}: {lesson.title}
                              {isCompleted && (
                                <span className="text-green-600 text-sm">✓ Completed</span>
                              )}
                            </div>
                            <div className="text-sm text-garden-earth/60">
                              10 questions from this lesson
                            </div>
                          </div>
                          <Button
                            onClick={() => startQuiz(10, "all", lesson.id)}
                            disabled={loading}
                            variant={isCompleted ? "outline" : "default"}
                            className="ml-4"
                          >
                            {isCompleted ? "Retake" : "Start Quiz"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
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
        {/* Exit Button */}
        <div className="max-w-2xl mx-auto mb-4">
          <Button
            onClick={resetQuiz}
            variant="outline"
            className="gap-2"
          >
            ← Exit Quiz
          </Button>
        </div>

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
          showRomanization={showRomanization}
          onToggleRomanization={() => setShowRomanization(!showRomanization)}
        />
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10 flex items-center justify-center">
        <p className="text-garden-earth/70">Loading quiz...</p>
      </div>
    }>
      <QuizPageContent />
    </Suspense>
  );
}
