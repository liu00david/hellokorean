"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Lesson } from "@/types/lesson";
import { useRouter } from "next/navigation";

interface LessonActionsProps {
  lessonId: string;
  lesson?: Lesson;
}

export function LessonActions({ lessonId, lesson }: LessonActionsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkCompletion();
    } else {
      setChecking(false);
    }
    fetchNextLesson();
  }, [user, lessonId]);

  const fetchNextLesson = async () => {
    if (!lesson?.group_id) return;

    try {
      // Fetch all lessons in this group, ordered by order_index
      const { data: groupLessons, error } = await supabase
        .from("lessons")
        .select("id, order_index")
        .eq("group_id", lesson.group_id)
        .order("order_index", { ascending: true });

      if (error || !groupLessons) {
        console.error("Error fetching group lessons:", error);
        return;
      }

      // Find current lesson index
      const currentIndex = groupLessons.findIndex(l => l.id === lessonId);

      // Get next lesson if it exists
      if (currentIndex !== -1 && currentIndex < groupLessons.length - 1) {
        setNextLessonId(groupLessons[currentIndex + 1].id);
      } else {
        setNextLessonId(null);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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


  const groupId = lesson?.group_id;

  if (checking) {
    return (
      <div className="py-4 border-t border-garden-earth/10">
        <div className="flex justify-between items-center">
          {groupId && (
            <Link href={`/lessons/${groupId}`}>
              <Button variant="outline" size="sm">← Back to Lessons</Button>
            </Link>
          )}
          <div className="text-sm text-garden-earth/50">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quiz button - Above the divider line */}
      <div className="flex justify-center">
        <Link href={`/quiz?lessonId=${lessonId}`} className="w-full sm:w-auto">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto">
            Take Lesson Quiz
          </Button>
        </Link>
      </div>

      {/* Divider and navigation section */}
      <div className="py-3 border-t border-garden-earth/10">
        {/* Horizontal Row on all screen sizes */}
        <div className="flex justify-between items-center gap-2">
          {/* Left: Back to Lessons */}
          {groupId && (
            <Link href={`/lessons/${groupId}`}>
              <Button variant="outline" size="sm">← Back to Lessons</Button>
            </Link>
          )}

          {/* Right: Primary Action (Next Lesson or Mark Complete) */}
          {isCompleted && nextLessonId ? (
            <Link href={`/lessons/${nextLessonId}`}>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Done! Next Lesson →
              </Button>
            </Link>
          ) : !isCompleted && user ? (
            <Button
              variant="default"
              size="sm"
              onClick={markAsComplete}
              disabled={loading}
              className="gap-1"
            >
              {loading ? "Saving..." : "✓ Mark as Completed"}
            </Button>
          ) : null}
        </div>

        {/* Celebration message for last lesson */}
        {isCompleted && !nextLessonId && (
          <div className="mt-3 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
            <p className="text-sm text-green-800 font-semibold">
              🎉 You've completed all lessons in this group!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
