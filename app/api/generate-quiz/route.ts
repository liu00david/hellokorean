import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateQuiz } from "@/lib/generateQuiz";
import { QuizType } from "@/types/quiz";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type") as QuizType | null;
    const countParam = searchParams.get("count");
    const lessonIdParam = searchParams.get("lessonId");

    const count = countParam ? parseInt(countParam) : 10;

    // Fetch dictionary entries
    let query = supabase.from("dictionary").select("*");

    // TODO: Filter by lesson if needed (would need lesson_id column in dictionary)
    // if (lessonIdParam) {
    //   query = query.eq("lesson_id", lessonIdParam);
    // }

    const { data: entries, error } = await query;

    if (error) {
      console.error("Error fetching dictionary:", error);
      return NextResponse.json(
        { error: "Failed to fetch dictionary entries" },
        { status: 500 }
      );
    }

    if (!entries || entries.length < 4) {
      return NextResponse.json(
        { error: "Not enough dictionary entries to generate quiz (need at least 4)" },
        { status: 400 }
      );
    }

    // Generate quiz questions
    const questions = generateQuiz(entries, count, typeParam || undefined);

    return NextResponse.json({
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
