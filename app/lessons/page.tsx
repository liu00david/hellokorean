"use client";

import { useEffect, useState } from "react";
import { getAllLessons } from "@/lib/lessons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Lesson } from "@/types/lesson";

export default function LessonsPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    // Fetch lessons
    const lessonsData = await getAllLessons();
    setLessons(lessonsData);

    // Fetch user progress if logged in
    if (user) {
      const { data, error } = await supabase
        .from("progress")
        .select("lesson_id")
        .eq("user_id", user.id);

      if (!error && data) {
        setCompletedLessons(new Set(data.map(p => p.lesson_id)));
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-garden-earth">
            📚 Lessons
          </h1>
          <p className="text-xl text-garden-earth/70">
            Start your Korean learning journey
          </p>
        </div>

        {/* Lessons Grid */}
        <div className="max-w-4xl mx-auto grid gap-6">
          {loading ? (
            <div className="text-center text-garden-earth/70">Loading lessons...</div>
          ) : (
            lessons.map((lesson, index) => {
              const isCompleted = completedLessons.has(lesson.id);
              return (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <Card className={`hover:shadow-lg transition-all cursor-pointer backdrop-blur ${
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
                          <CardTitle className="text-2xl mb-2">
                            {lesson.title}
                          </CardTitle>
                          <CardDescription className="text-garden-earth/70">
                            {lesson.objectives[0]}
                          </CardDescription>
                        </div>
                        <div className="text-4xl ml-4">
                          {isCompleted ? "✅" : index === 0 ? "🌱" : index === 1 ? "🌿" : "🌸"}
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
                          <span className="font-semibold">{lesson.sentences.length}</span> sentences
                        </div>
                        <div className="text-garden-earth/40">•</div>
                        <div className="text-sm text-garden-earth/60">
                          <span className="font-semibold">{lesson.explanation.length}</span> explanations
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Coming Soon */}
        {lessons.length === 0 && (
          <div className="max-w-2xl mx-auto text-center p-12 bg-white/50 rounded-2xl">
            <p className="text-xl text-garden-earth/70">
              🌱 Lessons are being prepared...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
