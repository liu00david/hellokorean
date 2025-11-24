"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Lesson } from "@/types/lesson";

interface LessonActionsProps {
  lessonId: string;
  lesson?: Lesson;
}

export function LessonActions({ lessonId, lesson }: LessonActionsProps) {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user) {
      checkCompletion();
    } else {
      setChecking(false);
    }
  }, [user, lessonId]);

  const checkCompletion = async () => {
    if (!user) return;

    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error checking completion:", error);
      }

      setIsCompleted(!!data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setChecking(false);
    }
  };

  const markAsComplete = async () => {
    if (!user) {
      alert("Please sign in to track your progress!");
      return;
    }

    setLoading(true);
    try {
      // Mark lesson as complete
      const { error: progressError } = await supabase.from("progress").insert({
        user_id: user.id,
        lesson_id: lessonId,
      });

      if (progressError) {
        console.error("Error marking lesson as complete:", progressError);
        alert("Failed to mark lesson as complete. Please try again.");
        return;
      }

      // Add vocabulary words to learned words
      if (lesson && lesson.vocabulary && lesson.vocabulary.length > 0) {
        const words = lesson.vocabulary.map((v) => v.word);

        // Get dictionary IDs for these words
        const { data: dictEntries, error: dictError } = await supabase
          .from("dictionary")
          .select("id, word")
          .in("word", words);

        if (dictError) {
          console.error("Error fetching dictionary entries:", dictError);
        } else if (dictEntries && dictEntries.length > 0) {
          // Add to learned_words
          const learnedWords = dictEntries.map((entry) => ({
            user_id: user.id,
            word_id: entry.id,
            confidence_level: 0,
            next_review_date: new Date().toISOString(),
          }));

          const { error: learnedError } = await supabase
            .from("learned_words")
            .upsert(learnedWords, {
              onConflict: "user_id,word_id",
              ignoreDuplicates: true,
            });

          if (learnedError) {
            console.error("Error adding words to learned words:", learnedError);
          }
        }
      }

      setIsCompleted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  if (checking) {
    return (
      <div className="flex justify-between items-center">
        <Link href="/lessons">
          <Button variant="outline">← All Lessons</Button>
        </Link>
        <div className="text-sm text-garden-earth/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center gap-4 flex-wrap">
      <Link href="/lessons">
        <Button variant="outline">← All Lessons</Button>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {isCompleted ? (
              <span className="text-lg text-garden-leaf font-semibold flex items-center gap-2">
                <span className="text-2xl">✓</span> Completed
              </span>
            ) : (
              <Button
                variant="default"
                onClick={markAsComplete}
                disabled={loading}
                className="gap-2"
              >
                {loading ? "Saving..." : "✓ Mark as Complete"}
              </Button>
            )}
          </>
        ) : (
          <p className="text-sm text-garden-earth/60">
            Sign in to track your progress
          </p>
        )}

        <Link href="/quiz">
          <Button variant="secondary" className="gap-2">
            Take Quiz ✏️
          </Button>
        </Link>
      </div>
    </div>
  );
}
