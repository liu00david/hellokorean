"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import { Lesson } from "@/types/lesson";

interface SubLessonsListProps {
  groupId: string;
  lessons: Lesson[];
}

export function SubLessonsList({ groupId, lessons }: SubLessonsListProps) {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("progress")
      .select("lesson_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setCompletedLessons(new Set(data.map(p => p.lesson_id)));
    }

    setLoading(false);
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center p-12 bg-white/50 rounded-2xl">
        <p className="text-xl text-garden-earth/70">
          🌱 Sub-lessons coming soon...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {lessons.map((lesson, index) => {
        const isCompleted = completedLessons.has(lesson.id);

        return (
          <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
            <Card className={`hover:shadow-lg transition-all cursor-pointer ${
              isCompleted
                ? "bg-green-50 border-green-300 hover:border-green-400"
                : "bg-white/80 border-garden-earth/10 hover:border-garden-pink"
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-garden-earth/60 mb-2 flex items-center gap-2">
                      Lesson {lesson.id}
                      {isCompleted && <span className="text-green-600 font-semibold">✓ Completed</span>}
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="text-garden-earth/70">
                      {lesson.objectives[0]}
                    </CardDescription>
                  </div>
                  <div className="text-3xl ml-4">
                    {isCompleted ? "✅" : "📝"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <div className="text-sm text-garden-earth/60">
                    <span className="font-semibold">{lesson.vocabulary.length}</span> words
                  </div>
                  <div className="text-garden-earth/40">•</div>
                  <div className="text-sm text-garden-earth/60">
                    <span className="font-semibold">{lesson.sentences.length}</span> examples
                  </div>
                  <div className="text-garden-earth/40">•</div>
                  <div className="text-sm text-garden-earth/60">
                    <span className="font-semibold">{lesson.explanation.length}</span> notes
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}

      {/* Back to Lessons Link */}
      <Link href="/lessons" className="mt-4">
        <div className="text-center p-4 text-garden-earth/60 hover:text-garden-earth transition-colors">
          ← Back to all lesson groups
        </div>
      </Link>
    </div>
  );
}
