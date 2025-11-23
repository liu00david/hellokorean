import { Lesson } from "@/types/lesson";
import { createClient } from "@supabase/supabase-js";

// Create a server-side Supabase client for lesson loading
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Transform database lesson to Lesson type
function transformLesson(dbLesson: any): Lesson {
  return {
    id: dbLesson.id,
    title: dbLesson.title,
    prerequisite: dbLesson.prerequisite,
    objectives: dbLesson.objectives,
    vocabulary: dbLesson.vocabulary,
    sentences: dbLesson.sentences,
    explanation: dbLesson.explanation,
  };
}
