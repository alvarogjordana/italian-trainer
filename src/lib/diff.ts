// ---------------------------------------------------------------------------
// Character-level diff (LCS based) for typing-mode feedback.
//
// charDiff(expected, actual) returns an ordered list of ops:
//   - "equal":   character present in both
//   - "missing": character in `expected` the user left out
//   - "extra":   character the user typed that isn't in `expected`
// Reconstruct `expected` from equal+missing, `actual` from equal+extra.
// ---------------------------------------------------------------------------

export type DiffOp = {
  type: "equal" | "missing" | "extra";
  char: string;
};

export function charDiff(expected: string, actual: string): DiffOp[] {
  const n = expected.length;
  const m = actual.length;

  // LCS length table.
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (expected[i] === actual[j]) {
        dp[i]![j] = dp[i + 1]![j + 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
      }
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (expected[i] === actual[j]) {
      ops.push({ type: "equal", char: expected[i]! });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      ops.push({ type: "missing", char: expected[i]! });
      i++;
    } else {
      ops.push({ type: "extra", char: actual[j]! });
      j++;
    }
  }
  while (i < n) ops.push({ type: "missing", char: expected[i++]! });
  while (j < m) ops.push({ type: "extra", char: actual[j++]! });

  return ops;
}
