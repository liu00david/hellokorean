import { getAllLessons } from "@/lib/lessons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function LessonsPage() {
  const lessons = await getAllLessons();

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
          {lessons.map((lesson, index) => (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-white/80 backdrop-blur border-garden-earth/10 hover:border-garden-pink">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-garden-earth/60 mb-2">
                        Lesson {index + 1}
                      </div>
                      <CardTitle className="text-2xl mb-2">
                        {lesson.title}
                      </CardTitle>
                      <CardDescription className="text-garden-earth/70">
                        {lesson.objectives[0]}
                      </CardDescription>
                    </div>
                    <div className="text-4xl ml-4">
                      {index === 0 ? "🌱" : index === 1 ? "🌿" : "🌸"}
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

                  {lesson.prerequisite && (
                    <div className="mt-4 text-sm text-garden-earth/60">
                      Prerequisites: {lesson.prerequisite}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
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
