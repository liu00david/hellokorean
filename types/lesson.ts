export interface VocabularyEntry {
  word: string;
  english: string;
  romanization: string;
  type: "noun" | "verb" | "adjective" | "adverb" | "particle" | "phrase" | "consonant" | "vowel" | "counter" | "number" | "unknown";
}

export interface Sentence {
  korean: string;
  english: string;
  romanization: string;
}

export interface Lesson {
  id: string;
  group_id: string;
  version?: string;
  title: string;
  objectives: string[];
  context: string[];
  vocabulary: VocabularyEntry[];
  sentences: Sentence[];
  explanation: string[];
}

export interface LessonGroup {
  id: string;
  title: string;
  description: string;
  order_index: number;
}
