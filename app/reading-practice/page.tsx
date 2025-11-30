"use client";

import { useEffect, useState } from "react";
import { getAllLessons, getAllLessonGroups } from "@/lib/lessons";
import { Lesson, LessonGroup } from "@/types/lesson";
import Link from "next/link";

export default function ReadingPracticePage() {
  const [lessonsByGroup, setLessonsByGroup] = useState<Map<string, Lesson[]>>(new Map());
  const [groups, setGroups] = useState<LessonGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load all lessons and groups
    const [lessonsData, groupsData] = await Promise.all([
      getAllLessons(),
      getAllLessonGroups()
    ]);

    // Filter to only lessons with dialogues
    const lessonsWithDialogues = lessonsData.filter(lesson => lesson.dialogue);

    // Group lessons by their group_id
    const grouped = new Map<string, Lesson[]>();
    lessonsWithDialogues.forEach(lesson => {
      const groupId = lesson.group_id;
      if (!grouped.has(groupId)) {
        grouped.set(groupId, []);
      }
      grouped.get(groupId)!.push(lesson);
    });

    // Filter groups to only those with dialogues
    const relevantGroups = groupsData.filter(group => grouped.has(group.id));

    setLessonsByGroup(grouped);
    setGroups(relevantGroups);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-6xl mb-6">💬</div>
          <h1 className="text-5xl font-bold mb-4 text-garden-earth">
            Reading
          </h1>
          <p className="text-xl text-garden-earth/70">
            Practice reading with natural dialogues
          </p>
        </div>

        {/* Lessons List */}
        {loading ? (
          <div className="text-center text-garden-earth/70">
            Loading dialogues...
          </div>
        ) : groups.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center p-12 bg-white/50 rounded-2xl">
            <p className="text-xl text-garden-earth/70 mb-4">
              📚 No dialogues available yet
            </p>
            <p className="text-sm text-garden-earth/60">
              Dialogues will be added to lessons soon!
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12">
            {groups.map((group) => {
              const groupLessons = lessonsByGroup.get(group.id) || [];

              return (
                <div key={group.id} className="space-y-4">
                  {/* Group Header */}
                  <div className="border-b border-garden-earth/20 pb-2">
                    <h2 className="text-2xl font-bold text-garden-earth">
                      Lesson {group.id}: {group.title}
                    </h2>
                    <p className="text-sm text-garden-earth/60 mt-1">
                      {group.description}
                    </p>
                  </div>

                  {/* Dialogue Rows */}
                  <div className="space-y-2">
                    {groupLessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/reading-practice/${lesson.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/80 backdrop-blur border border-garden-earth/10 hover:border-garden-lavender/50 hover:bg-garden-lavender/10 transition-all cursor-pointer group">
                          <div className="flex-1">
                            <div className="flex items-baseline gap-3">
                              <span className="text-sm font-semibold text-garden-earth/60">
                                {lesson.id}
                              </span>
                              <h3 className="text-lg font-semibold text-garden-earth group-hover:text-garden-lavender/80">
                                {lesson.dialogue?.title}
                              </h3>
                            </div>
                            <p className="text-sm text-garden-earth/60 mt-1">
                              {lesson.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-garden-earth/50">
                            <span className="text-xs">
                              {lesson.dialogue?.messages.length} messages
                            </span>
                            <span className="text-xl group-hover:translate-x-1 transition-transform">
                              →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
