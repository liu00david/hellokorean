import { Lesson, LessonGroup } from "@/types/lesson";
import { supabase } from "./supabase";

// Lesson Group functions
export async function getAllLessonGroups(): Promise<LessonGroup[]> {
  const { data, error } = await supabase
    .from("lesson_groups")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching lesson groups:", error);
    return [];
  }

  return data || [];
}

export async function getLessonGroupById(id: string): Promise<LessonGroup | null> {
  const { data, error } = await supabase
    .from("lesson_groups")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error loading lesson group ${id}:`, error);
    return null;
  }

  return data;
}

export async function getLessonsByGroupId(groupId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("group_id", groupId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error(`Error fetching lessons for group ${groupId}:`, error);
    return [];
  }

  return (data || []).map(transformLesson);
}

export async function getAllLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }

  return (data || []).map(transformLesson);
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error loading lesson ${id}:`, error);
    return null;
  }

  return transformLesson(data);
}

export async function getLessonIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("id")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching lesson IDs:", error);
    return [];
  }

  return (data || []).map((lesson) => lesson.id);
}

// Optimized function to get lesson groups with counts and user progress
export async function getLessonGroupsWithProgress(userId?: string): Promise<{
  groups: LessonGroup[];
  progress: Map<string, { completed: number; total: number; percentage: number }>;
}> {
  console.log('[getLessonGroupsWithProgress] Starting, userId:', userId);

  // Fetch lesson groups
  const { data: groups, error: groupsError } = await supabase
    .from("lesson_groups")
    .select("*")
    .order("order_index", { ascending: true });

  console.log('[getLessonGroupsWithProgress] Fetched groups:', groups?.length, 'error:', groupsError);

  if (groupsError) {
    console.error("Error fetching lesson groups:", groupsError);
    return { groups: [], progress: new Map() };
  }

  // Fetch lesson counts per group using aggregation
  const { data: lessonCounts, error: countsError } = await supabase
    .from("lessons")
    .select("group_id");

  console.log('[getLessonGroupsWithProgress] Fetched lesson counts:', lessonCounts?.length, 'error:', countsError);

  if (countsError) {
    console.error("Error fetching lesson counts:", countsError);
    return { groups: groups || [], progress: new Map() };
  }

  // Count lessons per group
  const groupCounts = new Map<string, number>();
  lessonCounts?.forEach(lesson => {
    groupCounts.set(lesson.group_id, (groupCounts.get(lesson.group_id) || 0) + 1);
  });
  console.log('[getLessonGroupsWithProgress] Group counts:', Object.fromEntries(groupCounts));

  // Fetch user progress if userId provided
  let completedByGroup = new Map<string, number>();
  if (userId) {
    console.log('[getLessonGroupsWithProgress] Fetching progress for user:', userId);
    const { data: progressData, error: progressError } = await supabase
      .from("progress")
      .select("lesson_id")
      .eq("user_id", userId);

    console.log('[getLessonGroupsWithProgress] Progress data:', progressData?.length, 'error:', progressError);

    if (!progressError && progressData && progressData.length > 0) {
      // Get group_id for each completed lesson
      const lessonIds = progressData.map(p => p.lesson_id);

      // Only query if there are lesson IDs to look up
      if (lessonIds.length > 0) {
        console.log('[getLessonGroupsWithProgress] Fetching completed lessons for IDs:', lessonIds.length);
        const { data: completedLessons } = await supabase
          .from("lessons")
          .select("id, group_id")
          .in("id", lessonIds);

        console.log('[getLessonGroupsWithProgress] Completed lessons:', completedLessons?.length);

        // Count completed lessons per group
        completedLessons?.forEach(lesson => {
          completedByGroup.set(lesson.group_id, (completedByGroup.get(lesson.group_id) || 0) + 1);
        });
        console.log('[getLessonGroupsWithProgress] Completed by group:', Object.fromEntries(completedByGroup));
      }
    }
  }

  // Build progress map
  const progressMap = new Map<string, { completed: number; total: number; percentage: number }>();
  (groups || []).forEach(group => {
    const total = groupCounts.get(group.id) || 0;
    const completed = completedByGroup.get(group.id) || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    console.log(`[getLessonGroupsWithProgress] Group ${group.id}: ${completed}/${total} = ${percentage}%`);

    progressMap.set(group.id, {
      completed,
      total,
      percentage
    });
  });

  console.log('[getLessonGroupsWithProgress] Completed, returning', groups?.length, 'groups');
  return { groups: groups || [], progress: progressMap };
}

// Database lesson type (matches Supabase schema)
interface DbLesson {
  id: string;
  group_id: string;
  version?: string;
  title: string;
  objectives: string[];
  context?: string[];
  vocabulary: Lesson['vocabulary'];
  sentences: Lesson['sentences'];
  explanation: string[];
}

// Transform database lesson to Lesson type
function transformLesson(dbLesson: DbLesson): Lesson {
  return {
    id: dbLesson.id,
    group_id: dbLesson.group_id,
    version: dbLesson.version,
    title: dbLesson.title,
    objectives: dbLesson.objectives,
    context: dbLesson.context || [],
    vocabulary: dbLesson.vocabulary,
    sentences: dbLesson.sentences,
    explanation: dbLesson.explanation,
  };
}
