"use client";

import { Lesson, VocabularyEntry } from "@/types/lesson";
import { WordTooltip } from "./WordTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface LessonRendererProps {
  lesson: Lesson;
}

export function LessonRenderer({ lesson }: LessonRendererProps) {
  // Create a map of Korean words to vocabulary entries for quick lookup
  const vocabMap = new Map<string, VocabularyEntry>();
  lesson.vocabulary.forEach((entry) => {
    vocabMap.set(entry.word, entry);
  });

  // Function to render Korean text with clickable words
  const renderKoreanText = (text: string) => {
    const words: JSX.Element[] = [];
    let currentWord = "";

    // Simple tokenization - split by spaces and check if each part has a vocab entry
    const parts = text.split(" ");

    parts.forEach((part, index) => {
      const entry = vocabMap.get(part);

      if (entry) {
        words.push(
          <WordTooltip key={`${part}-${index}`} word={part} entry={entry}>
            {part}
          </WordTooltip>
        );
      } else {
        words.push(<span key={`${part}-${index}`}>{part}</span>);
      }

      // Add space between words (except last one)
      if (index < parts.length - 1) {
        words.push(<span key={`space-${index}`}> </span>);
      }
    });

    return <>{words}</>;
  };

  return (
    <div className="space-y-8">
      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span> Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {lesson.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-garden-leaf mt-1">✓</span>
                <span className="text-garden-earth/80">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Context & Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📚</span> About This Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lesson.context.map((paragraph, index) => (
              <p key={index} className="text-garden-earth/80 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📖</span> Vocabulary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {lesson.vocabulary.map((entry, index) => (
              <div
                key={index}
                className="p-4 bg-garden-white rounded-xl border border-garden-earth/10 hover:border-garden-pink transition-colors"
              >
                <div className="text-2xl font-bold text-garden-earth mb-1 font-noto">
                  {entry.word}
                </div>
                <div className="text-lg text-garden-earth/80 mb-1">
                  {entry.english}
                </div>
                <div className="text-sm text-garden-earth/60 font-mono">
                  {entry.romanization}
                </div>
                <div className="mt-2">
                  <span className="text-xs bg-garden-lavender/50 px-2 py-1 rounded-lg">
                    {entry.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example Sentences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💬</span> Example Sentences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lesson.sentences.map((sentence, index) => (
              <div
                key={index}
                className="p-4 bg-garden-mint/10 rounded-xl border border-garden-earth/5"
              >
                <div className="text-2xl font-bold text-garden-earth mb-2 font-noto">
                  {renderKoreanText(sentence.korean)}
                </div>
                <div className="text-lg text-garden-earth/80 mb-1">
                  {sentence.english}
                </div>
                <div className="text-sm text-garden-earth/60 font-mono">
                  {sentence.romanization}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💡</span> Grammar & Usage Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lesson.explanation.map((note, index) => (
              <div
                key={index}
                className="p-4 bg-garden-lavender/10 rounded-xl border-l-4 border-garden-lavender"
              >
                <p className="text-garden-earth/80 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
