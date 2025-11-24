export type QuizType = "vocab" | "sentence" | "matching";
export type QuizDirection = "korean-to-english" | "english-to-korean";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  direction?: QuizDirection;
  question: string;
  questionRomanization?: string;
  answer: string;
  answerRomanization?: string;
  options: string[];
  optionsRomanization?: string[];
  lessonId?: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  completed_at: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Map<string, string>;
  score: number;
}
