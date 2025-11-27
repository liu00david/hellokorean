"use client";

import { useEffect, useState } from "react";
import { getLessonGroupsWithProgress } from "@/lib/lessons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { LessonGroup } from "@/types/lesson";

interface GroupProgress {
  completed: number;
  total: number;
  percentage: number;
}

export default function LessonsPage() {
  const { user } = useAuth();
  const [lessonGroups, setLessonGroups] = useState<LessonGroup[]>([]);
  const [groupProgress, setGroupProgress] = useState<Map<string, GroupProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    try {
      console.log('Loading lesson groups with progress for user:', user?.id);

      // Fetch lesson groups with progress in one optimized call
      const { groups, progress } = await getLessonGroupsWithProgress(user?.id);

      console.log('Loaded groups:', groups.length, 'progress entries:', progress.size);
      console.log('Progress Map details:', Array.from(progress.entries()));

      setLessonGroups(groups);
      setGroupProgress(progress);
    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setLoading(false);
    }
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

        {/* Lesson Groups Grid */}
        <div className="max-w-4xl mx-auto grid gap-6">
          {loading ? (
            <div className="text-center text-garden-earth/70">Loading lessons...</div>
          ) : (
            lessonGroups.map((group, index) => {
              const progress = groupProgress.get(group.id);
              const isComplete = progress?.percentage === 100;
              const hasProgress = progress && progress.percentage > 0;

              console.log(`Rendering group ${group.id}:`, progress);

              return (
                <Link key={group.id} href={`/lessons/${group.id}`}>
                  <Card className={`hover:shadow-lg transition-all cursor-pointer backdrop-blur ${
                    isComplete
                      ? "bg-green-50 border-green-300 hover:border-green-400"
                      : hasProgress
                      ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                      : "bg-white/80 border-garden-earth/10 hover:border-garden-pink"
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-garden-earth/60 mb-2 flex items-center gap-2">
                            Lesson {group.id}
                            {isComplete && <span className="text-green-600 font-semibold">✓ Complete</span>}
                            {hasProgress && !isComplete && (
                              <span className="text-blue-600 font-semibold">{progress.percentage}% Progress</span>
                            )}
                          </div>
                          <CardTitle className="text-2xl mb-2">
                            {group.title}
                          </CardTitle>
                          <CardDescription className="text-garden-earth/70">
                            {group.description}
                          </CardDescription>
                        </div>
                        <div className="text-4xl ml-4">
                          {isComplete ? "✅" : hasProgress ? "📖" : index === 0 ? "🌱" : index === 1 ? "🌿" : "🌸"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        {/* Progress Bar */}
                        {progress && progress.total > 0 && (
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-garden-earth/60 mb-1">
                              <span>{progress.completed} of {progress.total} lessons completed</span>
                              <span>{progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-garden-earth/10 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isComplete ? "bg-green-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {(!progress || progress.total === 0) && (
                          <div className="text-sm text-garden-earth/50 italic">
                            Coming soon
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Coming Soon */}
        {lessonGroups.length === 0 && !loading && (
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
