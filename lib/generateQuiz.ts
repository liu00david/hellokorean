import { DictionaryEntry } from "@/types/dictionary";
import { QuizQuestion, QuizType } from "@/types/quiz";

// Shuffle array helper
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

// Generate Korean to English question
function generateKoreanToEnglish(
  entry: DictionaryEntry,
  allEntries: DictionaryEntry[]
): QuizQuestion {
  // Get unique wrong answers (filter out correct answer and duplicates)
  const uniqueAnswers = new Set<string>();
  const wrongAnswers: string[] = [];

  // Filter out the current entry and shuffle
  const candidates = shuffle(allEntries.filter((e) => e.id !== entry.id));

  // Collect unique wrong answers
  for (const candidate of candidates) {
    if (candidate.english !== entry.english &&
        !uniqueAnswers.has(candidate.english)) {
      uniqueAnswers.add(candidate.english);
      wrongAnswers.push(candidate.english);
      if (wrongAnswers.length >= 3) break;
    }
  }

  // If we don't have enough unique answers, pad with what we have
  while (wrongAnswers.length < 3 && wrongAnswers.length < allEntries.length - 1) {
    wrongAnswers.push(`[Option ${wrongAnswers.length + 1}]`);
  }

  // Combine with correct answer and shuffle
  // Use Set to ensure no duplicates, then convert back to array
  const uniqueOptions = Array.from(new Set([entry.english, ...wrongAnswers]));
  const options = shuffle(uniqueOptions);

  return {
    id: `q-${entry.id}-ke`,
    type: "vocab",
    direction: "korean-to-english",
    question: entry.word,
    questionRomanization: entry.romanization,
    answer: entry.english,
    options,
  };
}

// Generate English to Korean question
function generateEnglishToKorean(
  entry: DictionaryEntry,
  allEntries: DictionaryEntry[]
): QuizQuestion {
  // Get unique wrong answers (filter out correct answer and duplicates)
  const uniqueAnswers = new Set<string>();
  const wrongAnswers: string[] = [];
  const wrongAnswersRomanization: string[] = [];

  // Filter out the current entry and shuffle
  const candidates = shuffle(allEntries.filter((e) => e.id !== entry.id));

  // Collect unique wrong answers with romanization
  for (const candidate of candidates) {
    if (candidate.word !== entry.word &&
        !uniqueAnswers.has(candidate.word)) {
      uniqueAnswers.add(candidate.word);
      wrongAnswers.push(candidate.word);
      wrongAnswersRomanization.push(candidate.romanization);
      if (wrongAnswers.length >= 3) break;
    }
  }

  // If we don't have enough unique answers, pad with what we have
  while (wrongAnswers.length < 3 && wrongAnswers.length < allEntries.length - 1) {
    wrongAnswers.push(`[보기 ${wrongAnswers.length + 1}]`); // "Option" in Korean
    wrongAnswersRomanization.push('');
  }

  // Combine with correct answer and shuffle
  // Use Set to ensure no duplicates, then convert back to array
  const uniqueOptions = Array.from(new Set([entry.word, ...wrongAnswers]));
  const allOptionsRomanization = [entry.romanization, ...wrongAnswersRomanization];

  // Create paired array and shuffle together
  const paired = uniqueOptions.map((opt, i) => ({
    option: opt,
    romanization: allOptionsRomanization[i]
  }));
  const shuffledPaired = shuffle(paired);

  const options = shuffledPaired.map(p => p.option);
  const optionsRomanization = shuffledPaired.map(p => p.romanization);

  return {
    id: `q-${entry.id}-ek`,
    type: "vocab",
    direction: "english-to-korean",
    question: entry.english,
    answer: entry.word,
    answerRomanization: entry.romanization,
    options,
    optionsRomanization,
  };
}

// Generate sentence translation question
function generateSentenceQuestion(
  entry: DictionaryEntry,
  direction: "korean-to-english" | "english-to-korean",
  allEntries: DictionaryEntry[]
): QuizQuestion | null {
  // Need examples for sentence questions
  if (!entry.examples || entry.examples.length === 0) {
    return null;
  }

  const example = entry.examples[0];

  if (direction === "korean-to-english") {
    // Get wrong answers from other entries' examples
    const uniqueAnswers = new Set<string>();
    const wrongAnswers: string[] = [];

    const candidates = allEntries.filter(
      (e) => e.id !== entry.id && e.examples && e.examples.length > 0
    );

    for (const candidate of candidates) {
      const answer = candidate.examples[0].english;
      if (answer !== example.english && !uniqueAnswers.has(answer)) {
        uniqueAnswers.add(answer);
        wrongAnswers.push(answer);
        if (wrongAnswers.length >= 3) break;
      }
    }

    if (wrongAnswers.length < 3) {
      return null; // Not enough wrong answers
    }

    const uniqueOptions = Array.from(new Set([example.english, ...wrongAnswers]));
    const options = shuffle(uniqueOptions);

    return {
      id: `q-${entry.id}-sent-ke`,
      type: "sentence",
      direction: "korean-to-english",
      question: example.korean,
      questionRomanization: example.romanization,
      answer: example.english,
      options,
    };
  } else {
    // English to Korean
    const uniqueAnswers = new Set<string>();
    const wrongAnswers: string[] = [];
    const wrongAnswersRomanization: string[] = [];

    const candidates = allEntries.filter(
      (e) => e.id !== entry.id && e.examples && e.examples.length > 0
    );

    for (const candidate of candidates) {
      const answer = candidate.examples[0].korean;
      if (answer !== example.korean && !uniqueAnswers.has(answer)) {
        uniqueAnswers.add(answer);
        wrongAnswers.push(answer);
        wrongAnswersRomanization.push(candidate.examples[0].romanization);
        if (wrongAnswers.length >= 3) break;
      }
    }

    if (wrongAnswers.length < 3) {
      return null;
    }

    const uniqueOptions = Array.from(new Set([example.korean, ...wrongAnswers]));
    const allOptionsRomanization = [example.romanization, ...wrongAnswersRomanization];

    // Create paired array and shuffle together
    const paired = uniqueOptions.map((opt, i) => ({
      option: opt,
      romanization: allOptionsRomanization[i]
    }));
    const shuffledPaired = shuffle(paired);

    const options = shuffledPaired.map(p => p.option);
    const optionsRomanization = shuffledPaired.map(p => p.romanization);

    return {
      id: `q-${entry.id}-sent-ek`,
      type: "sentence",
      direction: "english-to-korean",
      question: example.english,
      answer: example.korean,
      answerRomanization: example.romanization,
      options,
      optionsRomanization,
    };
  }
}

export function generateQuiz(
  entries: DictionaryEntry[],
  count: number = 10,
  type?: QuizType
): QuizQuestion[] {
  if (entries.length < 4) {
    throw new Error("Need at least 4 dictionary entries to generate a quiz");
  }

  const questions: QuizQuestion[] = [];

  // If we have fewer entries than needed, we'll cycle through them to reach the count
  // This allows repeating words when user has limited learned vocabulary
  const selectedEntries: DictionaryEntry[] = [];

  if (entries.length >= count) {
    // Normal case: enough entries, just pick random ones
    selectedEntries.push(...getRandomItems(entries, count));
  } else {
    // Repeat entries to reach the desired count
    const shuffledEntries = shuffle(entries);
    for (let i = 0; i < count; i++) {
      selectedEntries.push(shuffledEntries[i % shuffledEntries.length]);
    }
  }

  for (const entry of selectedEntries) {
    // Randomly choose question type if not specified
    const questionType = type || (Math.random() > 0.5 ? "vocab" : "sentence");

    if (questionType === "vocab") {
      // 50/50 chance for each direction
      if (Math.random() > 0.5) {
        questions.push(generateKoreanToEnglish(entry, entries));
      } else {
        questions.push(generateEnglishToKorean(entry, entries));
      }
    } else if (questionType === "sentence") {
      const direction =
        Math.random() > 0.5 ? "korean-to-english" : "english-to-korean";
      const question = generateSentenceQuestion(entry, direction, entries);
      if (question) {
        questions.push(question);
      } else {
        // Fallback to vocab if no examples
        questions.push(generateKoreanToEnglish(entry, entries));
      }
    }
  }

  return shuffle(questions).slice(0, count);
}
