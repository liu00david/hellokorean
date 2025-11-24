import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateQuiz } from "@/lib/generateQuiz";
import { QuizType } from "@/types/quiz";

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type") as QuizType | null;
    const countParam = searchParams.get("count");
    const sourceParam = searchParams.get("source") || "all"; // "learned" or "all"
    const userIdParam = searchParams.get("userId");
    const lessonIdParam = searchParams.get("lessonId");

    const count = countParam ? parseInt(countParam) : 10;

    let entries: any[] = [];

    if (lessonIdParam) {
      // Fetch entries for a specific lesson
      const { data, error } = await supabase
        .from("dictionary")
        .select("*")
        .contains("lessons", [lessonIdParam]);

      if (error) {
        console.error("Error fetching lesson words:", error);
        return NextResponse.json(
          { error: "Failed to fetch lesson words" },
          { status: 500 }
        );
      }

      entries = data || [];

      if (entries.length < 4) {
        return NextResponse.json(
          { error: "Not enough words in this lesson to generate quiz (need at least 4)" },
          { status: 400 }
        );
      }
    } else if (sourceParam === "learned" && userIdParam) {
      // Fetch only learned words for this user
      const { data, error } = await supabase
        .from("learned_words")
        .select(`
          word_id,
          dictionary (*)
        `)
        .eq("user_id", userIdParam);

      if (error) {
        console.error("Error fetching learned words:", error);
        return NextResponse.json(
          { error: "Failed to fetch learned words" },
          { status: 500 }
        );
      }

      // Extract dictionary entries from the joined data
      entries = (data || [])
        .map((item: any) => item.dictionary)
        .filter((entry: any) => entry !== null);

      if (entries.length === 0) {
        return NextResponse.json(
          { error: "No learned words yet. Complete some lessons first!" },
          { status: 400 }
        );
      }

      // If we have fewer words than needed for quiz, we'll generate with what we have
      // and the generateQuiz function will handle repeating questions
      if (entries.length < 4) {
        return NextResponse.json(
          { error: "Need at least 4 learned words to generate a quiz" },
          { status: 400 }
        );
      }
    } else {
      // Fetch all dictionary entries
      const { data, error } = await supabase
        .from("dictionary")
        .select("*")
        .order("word", { ascending: true });

      if (error) {
        console.error("Error fetching dictionary:", error);
        return NextResponse.json(
          { error: "Failed to fetch dictionary entries" },
          { status: 500 }
        );
      }

      entries = data || [];

      if (entries.length < 4) {
        return NextResponse.json(
          { error: "Not enough dictionary entries to generate quiz (need at least 4)" },
          { status: 400 }
        );
      }
    }

    // Generate quiz questions
    // The generateQuiz function will handle repeating questions if needed
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
