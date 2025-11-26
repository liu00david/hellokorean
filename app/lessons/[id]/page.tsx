import { getLessonById, getLessonIds, getLessonGroupById, getLessonsByGroupId, getAllLessonGroups } from "@/lib/lessons";
import { LessonRenderer } from "@/components/LessonRenderer";
import { notFound } from "next/navigation";
import { LessonActions } from "@/components/LessonActions";
import { SubLessonsList } from "@/components/SubLessonsList";

interface LessonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  // Generate params for both groups and lessons
  const groups = await getAllLessonGroups();
  const lessonIds = await getLessonIds();

  return [
    ...groups.map(g => ({ id: g.id })),
    ...lessonIds.map(id => ({ id }))
  ];
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;

  // Determine if this is a group ID or lesson ID
  const isGroupId = !id.includes('.');

  if (isGroupId) {
    // Show sub-lessons for this group
    const group = await getLessonGroupById(id);
    if (!group) {
      notFound();
    }

    const subLessons = await getLessonsByGroupId(id);

    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
        <div className="container mx-auto px-4 py-12">
          {/* Group Header */}
          <div className="mb-8 text-center">
            <div className="text-sm text-garden-earth/60 mb-2">Lesson {group.id}</div>
            <h1 className="text-5xl font-bold mb-4 text-garden-earth">
              {group.title}
            </h1>
            <p className="text-xl text-garden-earth/70 max-w-2xl mx-auto">
              {group.description}
            </p>
          </div>

          {/* Sub-Lessons List */}
          <div className="max-w-4xl mx-auto">
            <SubLessonsList groupId={id} lessons={subLessons} />
          </div>
        </div>
      </div>
    );
  } else {
    // Show individual lesson content
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
}
