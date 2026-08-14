"use client";

import { useEffect, useState } from "react";
import { speakItalian, speechSupported, primeVoices } from "@/lib/audio";
import { cn } from "@/lib/cn";

interface Props {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

/** Speaker button that reads an Italian string aloud via the Web Speech API. */
export function SpeakerButton({ text, className, size = "md", label }: Props) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(speechSupported());
    primeVoices();
  }, []);

  if (!supported) return null;

  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "sm" ? 14 : size === "lg" ? 22 : 18;

  return (
    <button
      type="button"
      aria-label={label ?? `Ascolta: ${text}`}
      title="Ascolta la pronuncia"
      onClick={(e) => {
        e.stopPropagation();
        speakItalian(text);
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border",
        "bg-surface-2 text-muted transition-colors hover:text-accent hover:border-accent/60",
        "focus-visible:text-accent active:scale-95",
        dim,
        className,
      )}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  );
}
