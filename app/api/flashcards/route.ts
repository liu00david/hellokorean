import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Flashcard, FlashcardDirection } from "@/types/flashcard";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const source = searchParams.get("source") || "learned"; // "learned" or "all"
    const dueOnly = searchParams.get("dueOnly") === "true";

    let flashcards: Flashcard[] = [];

    if (source === "all") {
      // Fetch all dictionary words (no user authentication required for reading)
      const { data: allWords, error } = await supabase
        .from("dictionary")
        .select("*")
        .order("word", { ascending: true });

      if (error) {
        console.error("Error fetching all words:", error);
        return NextResponse.json(
          { error: "Failed to fetch words" },
          { status: 500 }
        );
      }

      if (!allWords || allWords.length === 0) {
        return NextResponse.json({ flashcards: [] });
      }

      // Transform to flashcard format (no SRS data for "all" mode)
      flashcards = allWords.map((dict: any) => {
        const direction: FlashcardDirection =
          Math.random() > 0.5 ? "korean-to-english" : "english-to-korean";

        return {
          id: dict.id,
          wordId: dict.id,
          word: dict.word,
          english: dict.english,
          romanization: dict.romanization,
          type: dict.type,
          examples: dict.examples || [],
          direction,
          confidenceLevel: 0,
          correctCount: 0,
          wrongCount: 0,
          nextReviewDate: null,
          lastSeen: null,
        };
      });
    } else {
      // Fetch learned words for the user
      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required for learned words" },
          { status: 400 }
        );
      }

      // Build the query
      let query = supabase
        .from("learned_words")
        .select(
          `
          id,
          word_id,
          confidence_level,
          correct_count,
          wrong_count,
          next_review_date,
          last_seen,
          dictionary:word_id (
            id,
            word,
            english,
            romanization,
            type,
            examples
          )
        `
        )
        .eq("user_id", userId);

      // Filter by due date if requested
      if (dueOnly) {
        query = query.lte("next_review_date", new Date().toISOString());
      }

      const { data: learnedWords, error } = await query;

      if (error) {
        console.error("Error fetching flashcards:", error);
        return NextResponse.json(
          { error: "Failed to fetch flashcards" },
          { status: 500 }
        );
      }

      if (!learnedWords || learnedWords.length === 0) {
        return NextResponse.json({ flashcards: [] });
      }

      // Transform to flashcard format
      flashcards = learnedWords
        .filter((lw: any) => lw.dictionary) // Filter out any null dictionaries
        .map((lw: any) => {
          const dict = lw.dictionary;
          // Randomly choose direction for variety
          const direction: FlashcardDirection =
            Math.random() > 0.5 ? "korean-to-english" : "english-to-korean";

          return {
            id: lw.id,
            wordId: lw.word_id,
            word: dict.word,
            english: dict.english,
            romanization: dict.romanization,
            type: dict.type,
            examples: dict.examples || [],
            direction,
            confidenceLevel: lw.confidence_level || 0,
            correctCount: lw.correct_count || 0,
            wrongCount: lw.wrong_count || 0,
            nextReviewDate: lw.next_review_date,
            lastSeen: lw.last_seen,
          };
        });
    }

    // Shuffle the cards
    const shuffled = flashcards.sort(() => Math.random() - 0.5);

    return NextResponse.json({ flashcards: shuffled });
  } catch (error) {
    console.error("Error in flashcards API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint to mark words as learned (add to flashcard deck)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, wordIds } = body;

    if (!userId || !wordIds || !Array.isArray(wordIds)) {
      return NextResponse.json(
        { error: "User ID and word IDs array are required" },
        { status: 400 }
      );
    }

    // Insert learned words (ignore duplicates)
    const learnedWords = wordIds.map((wordId) => ({
      user_id: userId,
      word_id: wordId,
      confidence_level: 0,
      next_review_date: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("learned_words")
      .upsert(learnedWords, {
        onConflict: "user_id,word_id",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Error adding learned words:", error);
      return NextResponse.json(
        { error: "Failed to add words to flashcard deck" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error in flashcards POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
