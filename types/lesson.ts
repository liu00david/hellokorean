export interface VocabularyEntry {
  word: string;
  english: string;
  romanization: string;
  type: "noun" | "verb" | "adjective" | "adverb" | "particle" | "phrase" | "unknown";
}

export interface Sentence {
  korean: string;
  english: string;
  romanization: string;
}

export interface Lesson {
  id: string;
  title: string;
  prerequisite: string | null;
  objectives: string[];
  vocabulary: VocabularyEntry[];
  sentences: Sentence[];
  explanation: string[];
}
