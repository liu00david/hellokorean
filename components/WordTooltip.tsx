"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { VocabularyEntry } from "@/types/lesson";

interface WordTooltipProps {
  entry: VocabularyEntry;
  children: React.ReactNode;
}

export function WordTooltip({ entry, children }: WordTooltipProps) {
  return (
    <HoverCard.Root openDelay={200}>
      <HoverCard.Trigger asChild>
        <span className="cursor-help border-b-2 border-dotted border-garden-pink hover:bg-garden-pink/20 transition-colors rounded px-1">
          {children}
        </span>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className="bg-white rounded-xl shadow-xl p-4 w-64 border border-garden-earth/10 z-50"
          sideOffset={5}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold text-garden-earth font-noto">
              {entry.word}
            </div>
            <div className="text-lg text-garden-earth/80">
              {entry.english}
            </div>
            <div className="text-sm text-garden-earth/60 font-mono">
              {entry.romanization}
            </div>
            <div className="pt-2 border-t border-garden-earth/10">
              <span className="text-xs bg-garden-lavender/50 px-2 py-1 rounded-lg">
                {entry.type}
              </span>
            </div>
          </div>
          <HoverCard.Arrow className="fill-white" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
