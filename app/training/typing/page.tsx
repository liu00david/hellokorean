"use client";

import { useState } from "react";
import { TypingPractice } from "@/components/TypingPractice";
import { DictionaryEntry } from "@/types/dictionary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type TypingState = "setup" | "practice" | "results";
type TypingSource = "learned" | "all";

export default function TypingPracticePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<TypingState>("setup");
  const [source, setSource] = useState<TypingSource>("learned");
  const [words, setWords] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  const startPractice = async (count: number) => {
    setLoading(true);
    try {
      let entries: DictionaryEntry[] = [];

      if (source === "all") {
        // Fetch all dictionary words
        const { data, error } = await supabase
          .from("dictionary")
          .select("*")
          .order("word", { ascending: true });

        if (error) {
          console.error("Error fetching words:", error);
          alert("Failed to load words. Please try again.");
          setLoading(false);
          return;
        }

        entries = data || [];
      } else {
        // Fetch learned words
        if (!user) {
          alert("Please sign in to practice with learned words");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("learned_words")
          .select(`
            dictionary (*)
          `)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching learned words:", error);
          alert("Failed to load learned words. Please try again.");
          setLoading(false);
          return;
        }

        // Extract dictionary entries
        entries = (data || [])
          .map((item: any) => item.dictionary)
          .filter((entry: any) => entry !== null);
      }

      if (entries.length === 0) {
        alert(
          source === "learned"
            ? "No learned words yet. Complete some lessons first!"
            : "No words available in dictionary yet!"
        );
        setLoading(false);
        return;
      }

      // Shuffle and pick random words
      const shuffled = [...entries].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));
      setWords(selected);
      setState("practice");
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
                Please sign in to practice with learned words
              </div>
            )}

            <Card>
              <CardContent className="pt-6">
                <p className="text-garden-earth/70 mb-6">
                  Choose how many words to practice:
                </p>
                <div className="grid gap-4">
                  <Button
                    onClick={() => startPractice(5)}
                    disabled={loading || (source === "learned" && !user)}
                    variant="outline"
                    className="py-6"
                  >
                    Quick Practice (5 words)
                  </Button>
                  <Button
                    onClick={() => startPractice(10)}
                    disabled={loading || (source === "learned" && !user)}
                    variant="default"
                    className="py-6"
                  >
                    Standard Practice (10 words)
                  </Button>
                  <Button
                    onClick={() => startPractice(20)}
                    disabled={loading || (source === "learned" && !user)}
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
