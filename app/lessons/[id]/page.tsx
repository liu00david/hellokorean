import { getLessonById, getLessonIds } from "@/lib/lessons";
import { LessonRenderer } from "@/components/LessonRenderer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LessonActions } from "@/components/LessonActions";

interface LessonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const lessonIds = await getLessonIds();
  return lessonIds.map((id) => ({
    id,
  }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lesson = await getLessonById(id);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
      <div className="container mx-auto px-4 py-12">
        {/* Lesson Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4 text-garden-earth">
            {lesson.title}
          </h1>
        </div>

        {/* Lesson Content */}
        <div className="max-w-4xl mx-auto">
          <LessonRenderer lesson={lesson} />
        </div>

        {/* Lesson Actions (Client Component) */}
        <div className="max-w-4xl mx-auto mt-12">
          <LessonActions lessonId={id} lesson={lesson} />
        </div>
      </div>
    </div>
  );
}
