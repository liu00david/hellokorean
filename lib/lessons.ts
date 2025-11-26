import { Lesson, LessonGroup } from "@/types/lesson";
import { createClient } from "@supabase/supabase-js";

// Create a server-side Supabase client for lesson loading
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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
