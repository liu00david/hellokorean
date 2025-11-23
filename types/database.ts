export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface LearnedWord {
  id: string;
  user_id: string;
  word_id: string;
  first_seen: string;
  last_seen: string;
  correct_count: number;
  wrong_count: number;
  confidence_level: number;
  next_review_date: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  completed_at: string;
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      dictionary: {
        Row: {
          id: string;
          word: string;
          english: string;
          romanization: string;
          type: string;
          examples: any;
          created_at: string;
        };
        Insert: Omit<{
          id: string;
          word: string;
          english: string;
          romanization: string;
          type: string;
          examples: any;
          created_at: string;
        }, "id" | "created_at">;
        Update: Partial<Omit<{
          id: string;
          word: string;
          english: string;
          romanization: string;
          type: string;
          examples: any;
          created_at: string;
        }, "id" | "created_at">>;
      };
      progress: {
        Row: Progress;
        Insert: Omit<Progress, "id">;
        Update: Partial<Omit<Progress, "id">>;
      };
      learned_words: {
        Row: LearnedWord;
        Insert: Omit<LearnedWord, "id">;
        Update: Partial<Omit<LearnedWord, "id">>;
      };
      quiz_results: {
        Row: QuizResult;
        Insert: Omit<QuizResult, "id">;
        Update: Partial<Omit<QuizResult, "id">>;
      };
    };
  };
}
