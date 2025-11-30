"use client";

import { use, useEffect, useState } from "react";
import { getLessonById } from "@/lib/lessons";
import { Lesson, DialogueMessage } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakerButton } from "@/components/SpeakerButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function DialoguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRomanization, setShowRomanization] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    setLoading(true);
    const lessonData = await getLessonById(id);
    setLesson(lessonData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl text-garden-earth/70">Loading dialogue...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !lesson.dialogue) {
    return notFound();
  }

  const dialogue = lesson.dialogue;

  // Get unique speakers and assign colors
  const speakers = Array.from(new Set(dialogue.messages.map(m => m.speaker)));
  const speakerColors: Record<string, string> = {};
  const colors = [
    "bg-garden-pink/20 border-garden-pink/30",
    "bg-garden-mint/20 border-garden-mint/30",
    "bg-garden-lavender/20 border-garden-lavender/30",
    "bg-blue-100/50 border-blue-200",
  ];
  speakers.forEach((speaker, index) => {
    speakerColors[speaker] = colors[index % colors.length];
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-6">
          <Link href="/reading-practice">
            <Button variant="outline" size="sm" className="mb-4">
              ← Back to Reading
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-garden-earth/60 mb-1">
                    Lesson {lesson.id}
                  </div>
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    {dialogue.title}
                  </CardTitle>
                  <div className="text-sm text-garden-earth/70">
                    {lesson.title}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={showRomanization ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRomanization(!showRomanization)}
                  className="text-xs md:text-sm"
                >
                  {showRomanization ? "Hide" : "Show"} Romanization
                </Button>
                <Button
                  variant={showEnglish ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowEnglish(!showEnglish)}
                  className="text-xs md:text-sm"
                >
                  {showEnglish ? "Hide" : "Show"} English
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogue Messages - Enclosed Container */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-garden-earth/10 p-6 md:p-8 shadow-sm">
            <div className="space-y-4">
              {dialogue.messages.map((message: DialogueMessage, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    index % 2 === 0 ? "justify-start" : "justify-end"
                  }`}
                >
                  <div className={`max-w-[70%] md:max-w-[60%]`}>
                    {/* Speaker name */}
                    <div
                      className={`text-xs md:text-sm font-semibold mb-1 ${
                        index % 2 === 0 ? "text-left" : "text-right"
                      } text-garden-earth/70`}
                    >
                      {message.speaker}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`p-3 md:p-4 rounded-2xl border-2 ${
                        speakerColors[message.speaker]
                      } ${
                        index % 2 === 0
                          ? "rounded-tl-none"
                          : "rounded-tr-none"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          {/* Korean text */}
                          <div className="text-base md:text-lg font-noto text-garden-earth mb-1">
                            {message.korean}
                          </div>

                          {/* Romanization (optional) */}
                          {showRomanization && (
                            <div className="text-xs md:text-sm text-garden-earth/50 font-mono mb-1">
                              {message.romanization}
                            </div>
                          )}

                          {/* English translation (optional) */}
                          {showEnglish && (
                            <div className="text-xs md:text-sm text-garden-earth/70 mt-2">
                              {message.english}
                            </div>
                          )}
                        </div>

                        {/* Audio button */}
                        <div className="flex-shrink-0 mt-0.5">
                          <SpeakerButton text={message.korean} size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back button at bottom */}
        <div className="max-w-3xl mx-auto mt-8">
          <Link href="/reading-practice">
            <Button variant="outline" className="w-full md:w-auto">
              ← Back to Reading
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
