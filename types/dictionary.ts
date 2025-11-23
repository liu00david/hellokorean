export interface DictionaryEntry {
  id: string;
  word: string;
  english: string;
  romanization: string;
  type: "noun" | "verb" | "adjective" | "adverb" | "particle" | "phrase" | "unknown";
  examples: ExampleSentence[];
  created_at: string;
}

export interface ExampleSentence {
  korean: string;
  english: string;
  romanization: string;
}

export interface DictionaryFilters {
  search?: string;
  type?: string;
  sortBy?: "word" | "created_at";
  sortOrder?: "asc" | "desc";
}
