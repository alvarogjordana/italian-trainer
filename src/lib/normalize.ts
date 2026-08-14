// ---------------------------------------------------------------------------
// Text normalisation and answer matching for typing mode.
// Diacritic-insensitive: "citta" matches "città", "e" matches "è".
// ---------------------------------------------------------------------------

/** Strip accents/diacritics and lowercase; collapse whitespace. */
export function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining diacritical marks
    .replace(/\s+/g, " ");
}

/** Loose comparison used for accepting typed answers. */
export function answersMatch(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

/**
 * Some entries carry several acceptable translations separated by "/" or ",".
 * Accept the answer if it matches any of them.
 */
export function matchesAny(answer: string, accepted: string): boolean {
  const candidates = accepted
    .split(/[/,;]|\bo\b/)
    .map((s) => s.trim())
    .filter(Boolean);
  const target = candidates.length > 0 ? candidates : [accepted];
  return target.some((c) => answersMatch(answer, c));
}
