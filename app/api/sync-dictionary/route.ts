import { NextResponse } from "next/server";
import { getAllLessons } from "@/lib/lessons";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    // Get all lessons
    const lessons = getAllLessons();

    let wordsAdded = 0;
    let wordsUpdated = 0;
    const errors: string[] = [];

    // Extract all unique vocabulary entries
    const vocabularyMap = new Map();

    for (const lesson of lessons) {
      for (const vocab of lesson.vocabulary) {
        const existingEntry = vocabularyMap.get(vocab.word);

        if (!existingEntry) {
          // First time seeing this word
          vocabularyMap.set(vocab.word, {
            word: vocab.word,
            english: vocab.english,
            romanization: vocab.romanization,
            type: vocab.type,
            examples: lesson.sentences
              .filter(s => s.korean.includes(vocab.word))
              .map(s => ({
                korean: s.korean,
                english: s.english,
                romanization: s.romanization,
              })),
          });
        } else {
          // Word already exists, add more examples if found
          const newExamples = lesson.sentences
            .filter(s => s.korean.includes(vocab.word))
            .map(s => ({
              korean: s.korean,
              english: s.english,
              romanization: s.romanization,
            }));

          existingEntry.examples.push(...newExamples);
        }
      }
    }

    // Insert or update each word in the database
    for (const [word, entry] of vocabularyMap) {
      try {
        // Check if word exists
        const { data: existing, error: selectError } = await supabase
          .from("dictionary")
          .select("id")
          .eq("word", word)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          // PGRST116 is "no rows returned", which is fine
          console.error("Error checking word:", selectError);
          errors.push(`Error checking ${word}: ${selectError.message}`);
          continue;
        }

        if (existing) {
          // Update existing word
          const { error: updateError } = await supabase
            .from("dictionary")
            .update({
              english: entry.english,
              romanization: entry.romanization,
              type: entry.type,
              examples: entry.examples,
            })
            .eq("id", existing.id);

          if (updateError) {
            console.error("Error updating word:", updateError);
            errors.push(`Error updating ${word}: ${updateError.message}`);
          } else {
            wordsUpdated++;
          }
        } else {
          // Insert new word
          const { error: insertError } = await supabase
            .from("dictionary")
            .insert({
              word: entry.word,
              english: entry.english,
              romanization: entry.romanization,
              type: entry.type,
              examples: entry.examples,
            });

          if (insertError) {
            console.error("Error inserting word:", insertError);
            errors.push(`Error inserting ${word}: ${insertError.message}`);
          } else {
            wordsAdded++;
          }
        }
      } catch (error) {
        console.error("Error processing word:", error);
        errors.push(`Error processing ${word}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      wordsAdded,
      wordsUpdated,
      totalWords: vocabularyMap.size,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Dictionary sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({
    message: "Use POST to sync dictionary",
    endpoint: "/api/sync-dictionary",
  });
}
