import { DictionaryEntry } from "./dictionary";

export type FlashcardDirection = "korean-to-english" | "english-to-korean";

export type ConfidenceLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface Flashcard {
  id: string;
  wordId: string;
  word: string;
  english: string;
  romanization: string;
  type: string;
  examples?: { korean: string; english: string }[];
  direction: FlashcardDirection;
  confidenceLevel: ConfidenceLevel;
  correctCount: number;
  wrongCount: number;
  nextReviewDate: string;
  lastSeen: string;
}

export interface FlashcardSession {
  cards: Flashcard[];
  currentIndex: number;
  correct: number;
  wrong: number;
}

export interface FlashcardReview {
  wordId: string;
  confidence: ConfidenceLevel;
  correct: boolean;
}

// SRS intervals in days based on confidence level
export const SRS_INTERVALS: Record<ConfidenceLevel, number> = {
  0: 0, // New - show immediately
  1: 1, // Hard - 1 day
  2: 3, // Medium - 3 days
  3: 7, // Good - 1 week
  4: 14, // Easy - 2 weeks
  5: 30, // Mastered - 1 month
};
