// ---------------------------------------------------------------------------
// Text-to-speech via the Web Speech API. Prefers an it-IT voice when one is
// installed; degrades silently when speech synthesis is unavailable.
// ---------------------------------------------------------------------------

let cachedItalianVoice: SpeechSynthesisVoice | null | undefined;

function pickItalianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  const italian =
    voices.find((v) => v.lang.toLowerCase() === "it-it") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("it")) ??
    null;
  return italian;
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakItalian(text: string): void {
  if (!speechSupported() || !text.trim()) return;

  // Voice list may load asynchronously; refresh the cache when empty.
  if (cachedItalianVoice === undefined || cachedItalianVoice === null) {
    cachedItalianVoice = pickItalianVoice();
  }

  const synth = window.speechSynthesis;
  synth.cancel(); // stop anything already speaking for snappy repeated taps

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  if (cachedItalianVoice) utterance.voice = cachedItalianVoice;
  synth.speak(utterance);
}

/** Warm up the voice list (some browsers populate it lazily). */
export function primeVoices(): void {
  if (!speechSupported()) return;
  const load = () => {
    cachedItalianVoice = pickItalianVoice();
  };
  load();
  window.speechSynthesis.onvoiceschanged = load;
}
