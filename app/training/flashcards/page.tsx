"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { Flashcard } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type FlashcardState = "setup" | "review" | "results";
type FlashcardSource = "learned" | "all";

export default function FlashcardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<FlashcardState>("setup");
  const [source, setSource] = useState<FlashcardSource>("learned");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [dueCount, setDueCount] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [allCount, setAllCount] = useState(0);

  useEffect(() => {
    fetchCardCounts();
  }, [user, source]);

  const fetchCardCounts = async () => {
    try {
      // Fetch all words count
      const allResponse = await fetch(`/api/flashcards?source=all`);
      const allData = await allResponse.json();
      setAllCount(allData.flashcards?.length || 0);

      if (user) {
        // Fetch due cards count (learned words only)
        const dueResponse = await fetch(
          `/api/flashcards?userId=${user.id}&source=learned&dueOnly=true`
        );
        const dueData = await dueResponse.json();
        setDueCount(dueData.flashcards?.length || 0);

        // Fetch all learned words count
        const learnedResponse = await fetch(
          `/api/flashcards?userId=${user.id}&source=learned`
        );
        const learnedData = await learnedResponse.json();
        setLearnedCount(learnedData.flashcards?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching card counts:", error);
    }
  };

  const startReview = async (dueOnly: boolean = false) => {
    setLoading(true);
    try {
      let url = "";

      if (source === "all") {
        url = `/api/flashcards?source=all`;
      } else {
        if (!user) {
          alert("Please sign in to review learned words");
          setLoading(false);
          return;
        }
        url = dueOnly
          ? `/api/flashcards?userId=${user.id}&source=learned&dueOnly=true`
          : `/api/flashcards?userId=${user.id}&source=learned`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setState("review");
      } else {
        if (source === "learned") {
          alert(
            dueOnly
              ? "No cards are due for review! Check back later or review all cards."
              : "You haven't learned any words yet! Complete some lessons first."
          );
        } else {
          alert("No words available in dictionary yet!");
        }
      }
    } catch (error) {
      console.error("Error starting flashcard review:", error);
      alert("Failed to load flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (reviewStats: { correct: number; wrong: number }) => {
    setStats(reviewStats);
    setState("results");
  };

  const resetReview = () => {
    setState("setup");
    setFlashcards([]);
    setStats({ correct: 0, wrong: 0 });
    fetchCardCounts();
  };

  if (state === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🎴</div>
            <h1 className="text-5xl font-bold mb-4 text-garden-earth">
              Flashcards
            </h1>
            <p className="text-xl text-garden-earth/70 mb-8">
              Review vocabulary with spaced repetition
            </p>

            {/* Tabs for Learned/All Words */}
            <div className="flex justify-center gap-2 mb-8">
              <button
                onClick={() => setSource("learned")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  source === "learned"
                    ? "bg-garden-pink text-garden-earth shadow-md"
                    : "bg-white/50 text-garden-earth/60 hover:bg-white/80"
                }`}
              >
                Learned Words
              </button>
              <button
                onClick={() => setSource("all")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  source === "all"
                    ? "bg-garden-pink text-garden-earth shadow-md"
                    : "bg-white/50 text-garden-earth/60 hover:bg-white/80"
                }`}
              >
                All Words
              </button>
            </div>

            {/* Warning for non-authenticated users on learned mode */}
            {!user && source === "learned" && (
              <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                Please sign in to review your learned words
              </div>
            )}

            <Card>
              <CardContent className="pt-6">
                {source === "learned" && user ? (
                  <>
                    <div className="grid gap-4 mb-6">
                      <div className="flex items-center justify-between p-4 bg-garden-mint/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">⏰</span>
                          <div className="text-left">
                            <div className="font-semibold text-garden-earth">
                              Due for Review
                            </div>
                            <div className="text-sm text-garden-earth/60">
                              Cards ready to practice now
                            </div>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-garden-pink">
                          {dueCount}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-garden-lavender/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">📚</span>
                          <div className="text-left">
                            <div className="font-semibold text-garden-earth">
                              Learned Words
                            </div>
                            <div className="text-sm text-garden-earth/60">
                              Words from completed lessons
                            </div>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-garden-lavender">
                          {learnedCount}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <Button
                        onClick={() => startReview(true)}
                        disabled={loading || dueCount === 0}
                        variant="default"
                        className="py-6"
                      >
                        {dueCount > 0
                          ? `Review Due Cards (${dueCount})`
                          : "No Cards Due"}
                      </Button>
                      <Button
                        onClick={() => startReview(false)}
                        disabled={loading || learnedCount === 0}
                        variant="outline"
                        className="py-6"
                      >
                        {learnedCount > 0
                          ? `Review All Learned Words (${learnedCount})`
                          : "No Learned Words Yet"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 bg-garden-lavender/10 rounded-xl mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">📖</span>
                        <div className="text-left">
                          <div className="font-semibold text-garden-earth">
                            All Words
                          </div>
                          <div className="text-sm text-garden-earth/60">
                            Complete dictionary
                          </div>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-garden-lavender">
                        {allCount}
                      </div>
                    </div>

                    <Button
                      onClick={() => startReview(false)}
                      disabled={loading || allCount === 0}
                      variant="default"
                      className="py-6 w-full"
                    >
                      {allCount > 0
                        ? `Review All Words (${allCount})`
                        : "No Words Available"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (state === "results") {
    const percentage = Math.round(
      (stats.correct / (stats.correct + stats.wrong)) * 100
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-4xl mb-4">
                Review Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="text-8xl mb-4">
                  {percentage >= 80 ? "🎉" : percentage >= 60 ? "😊" : "💪"}
                </div>

                <div>
                  <p className="text-3xl font-bold text-garden-leaf mb-2">
                    {stats.correct} / {stats.correct + stats.wrong}
                  </p>
                  <p className="text-xl text-garden-earth/60">
                    {percentage}% correct
                  </p>
                </div>

                <div className="w-full bg-garden-earth/10 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-garden-leaf h-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex gap-4 justify-center mt-8">
                  <Button onClick={resetReview} variant="default" className="gap-2">
                    🔄 Review More
                  </Button>
                  <Button
                    onClick={() => router.push("/lessons")}
                    variant="outline"
                    className="gap-2"
                  >
                    📚 Back to Lessons
                  </Button>
                </div>

                <div className="mt-8 p-4 bg-garden-mint/10 rounded-xl">
                  <p className="text-sm text-garden-earth/70">
                    {percentage >= 80
                      ? "Excellent work! Your vocabulary is really improving! 🌸"
                      : percentage >= 60
                      ? "Good job! Keep practicing to strengthen your memory! 💪"
                      : "Keep going! Consistency is key to learning. 화이팅! 🌱"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
      <div className="container mx-auto px-4 py-12">
        <FlashcardDeck cards={flashcards} onComplete={handleComplete} />
      </div>
    </div>
  );
}
