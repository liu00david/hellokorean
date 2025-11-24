"use client";

import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    wordsLearned: 0,
    quizzesTaken: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get completed lessons count
      const { count: lessonsCount } = await supabase
        .from("progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get learned words count
      const { count: wordsCount } = await supabase
        .from("learned_words")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get quizzes taken count
      const { count: quizzesCount } = await supabase
        .from("quiz_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get recent quiz results
      const { data: quizData } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(5);

      setStats({
        lessonsCompleted: lessonsCount || 0,
        wordsLearned: wordsCount || 0,
        quizzesTaken: quizzesCount || 0,
      });

      setRecentQuizzes(quizData || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10 flex items-center justify-center">
        <p className="text-garden-earth/70">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-4 border-garden-pink"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-garden-earth mb-1">
                    {user.user_metadata?.name || "Korean Learner"}
                  </h1>
                  <p className="text-garden-earth/60">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-6xl mb-2">
                  📚
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-garden-earth mb-1">
                  {stats.lessonsCompleted}
                </div>
                <div className="text-sm text-garden-earth/60">
                  Lessons Completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-6xl mb-2">
                  📖
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-garden-earth mb-1">
                  {stats.wordsLearned}
                </div>
                <div className="text-sm text-garden-earth/60">
                  Words Learned
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-6xl mb-2">
                  ✏️
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-garden-earth mb-1">
                  {stats.quizzesTaken}
                </div>
                <div className="text-sm text-garden-earth/60">
                  Quizzes Taken
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/lessons">
                  <Button variant="default" className="w-full gap-2">
                    📚 Continue Learning
                  </Button>
                </Link>
                <Link href="/dictionary">
                  <Button variant="secondary" className="w-full gap-2">
                    📖 Browse Dictionary
                  </Button>
                </Link>
                <Link href="/quiz">
                  <Button variant="outline" className="w-full gap-2">
                    ✏️ Take a Quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Quiz Results */}
          {recentQuizzes.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Quiz Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQuizzes.map((quiz, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-garden-white rounded-xl border border-garden-earth/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {quiz.score >= 90
                            ? "🎉"
                            : quiz.score >= 70
                            ? "😊"
                            : quiz.score >= 50
                            ? "👍"
                            : "💪"}
                        </div>
                        <div>
                          <div className="font-semibold text-garden-earth">
                            Score: {quiz.score}%
                          </div>
                          <div className="text-sm text-garden-earth/60">
                            {new Date(quiz.completed_at).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(quiz.completed_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          quiz.score >= 70
                            ? "text-garden-leaf"
                            : "text-orange-600"
                        }`}
                      >
                        {quiz.score}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member Since */}
          <div className="mt-8 text-center text-sm text-garden-earth/60">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
