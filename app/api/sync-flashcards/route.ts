import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAllLessons } from "@/lib/lessons";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get ALL dictionary words (not just from completed lessons)
    const { data: dictEntries, error: dictError } = await supabase
      .from("dictionary")
      .select("id, word");

    if (dictError) {
      console.error("Error fetching dictionary entries:", dictError);
      return NextResponse.json(
        { error: "Failed to fetch dictionary entries" },
        { status: 500 }
      );
    }

    if (!dictEntries || dictEntries.length === 0) {
      return NextResponse.json({
        message: "No words found in dictionary. Sync dictionary first!",
        wordsAdded: 0,
      });
    }

    // Add to learned_words
    const learnedWords = dictEntries.map((entry) => ({
      user_id: userId,
      word_id: entry.id,
      confidence_level: 0,
      next_review_date: new Date().toISOString(),
    }));

    const { data, error: learnedError } = await supabase
      .from("learned_words")
      .upsert(learnedWords, {
        onConflict: "user_id,word_id",
        ignoreDuplicates: true,
      })
      .select();

    if (learnedError) {
      console.error("Error adding words to flashcards:", learnedError);
      return NextResponse.json(
        { error: "Failed to add words to flashcard deck" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wordsAdded: data?.length || 0,
      message: `Successfully added ${data?.length || 0} words to your flashcard deck!`,
    });
  } catch (error) {
    console.error("Error in sync-flashcards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
