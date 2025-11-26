"use client";

import { speakKorean } from "@/lib/speech";
import { useState } from "react";

interface SpeakerButtonProps {
  text: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SpeakerButton({ text, size = "md", className = "" }: SpeakerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsPlaying(true);
    speakKorean(text);

    // Reset playing state after a delay
    setTimeout(() => setIsPlaying(false), 1000);
  };

  const sizeClasses = {
    sm: "text-sm p-1",
    md: "text-base p-1.5",
    lg: "text-lg p-2"
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full hover:bg-garden-mint/20 transition-colors ${sizeClasses[size]} ${className}`}
      title="Play audio"
      aria-label="Play Korean pronunciation"
    >
      {isPlaying ? "🔉" : "🔊"}
    </button>
  );
}
