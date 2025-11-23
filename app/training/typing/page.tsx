"use client";

import { useState, useEffect } from "react";
import { TypingPractice } from "@/components/TypingPractice";
import { DictionaryEntry } from "@/types/dictionary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type TypingState = "setup" | "practice" | "results";

export default function TypingPracticePage() {
  const router = useRouter();
  const [state, setState] = useState<TypingState>("setup");
  const [words, setWords] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  const startPractice = async (count: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dictionary`);
      const data = await response.json();

      if (data.entries && data.entries.length > 0) {
        // Shuffle and pick random words
        const shuffled = [...data.entries].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));
        setWords(selected);
        setState("practice");
      } else {
        alert("No words available. Please sync the dictionary first!");
      }
    } catch (error) {
      console.error("Error loading words:", error);
      alert("Failed to load words. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (practiceStats: {
    correct: number;
    wrong: number;
  }) => {
    setStats(practiceStats);
    setState("results");
  };

  const resetPractice = () => {
    setState("setup");
    setWords([]);
    setStats({ correct: 0, wrong: 0 });
  };

  if (state === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">⌨️</div>
            <h1 className="text-5xl font-bold mb-4 text-garden-earth">
              Typing Practice
            </h1>
            <p className="text-xl text-garden-earth/70 mb-8">
              Practice typing Korean words
            </p>

            <Card>
              <CardContent className="pt-6">
                <p className="text-garden-earth/70 mb-6">
                  Choose how many words to practice:
                </p>
                <div className="grid gap-4">
                  <Button
                    onClick={() => startPractice(5)}
                    disabled={loading}
                    variant="outline"
                    className="py-6"
                  >
                    Quick Practice (5 words)
                  </Button>
                  <Button
                    onClick={() => startPractice(10)}
                    disabled={loading}
                    variant="default"
                    className="py-6"
                  >
                    Standard Practice (10 words)
                  </Button>
                  <Button
                    onClick={() => startPractice(20)}
                    disabled={loading}
                    variant="secondary"
                    className="py-6"
                  >
                    Extended Practice (20 words)
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-garden-mint/10 rounded-xl">
                  <p className="text-sm text-garden-earth/70">
                    💡 Make sure you have a Korean keyboard installed and
                    enabled on your device!
                  </p>
                </div>
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
                Practice Complete!
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
                  <Button
                    onClick={resetPractice}
                    variant="default"
                    className="gap-2"
                  >
                    🔄 Practice More
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
                      ? "Excellent typing! Your Korean input is getting better! 🌸"
                      : percentage >= 60
                      ? "Good work! Keep practicing your Korean typing! 💪"
                      : "Keep going! Typing practice will help you remember the words! 화이팅! 🌱"}
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
        <TypingPractice words={words} onComplete={handleComplete} />
      </div>
    </div>
  );
}
