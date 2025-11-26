// Web Speech API utility for Korean text-to-speech

export function speakKorean(text: string) {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.9; // Slightly slower for learning
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

// Get available Korean voices (useful for debugging)
export function getKoreanVoices(): SpeechSynthesisVoice[] {
  if (!window.speechSynthesis) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith('ko'));
}
