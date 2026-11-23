// One Emoji, One Smile — make.fun entry (program/v1)
//
// The whole entry is a single emoji: a grinning face with smiling eyes.
// It is the warmest single emoji for a stranger at first glance: a big,
// genuine, unguarded smile — joyful and friendly, with no words, no
// caption, no explanation, and nothing a stranger could read as intimate,
// sarcastic, or flirty. It is instantly readable in any culture and it
// smiles back at whoever sees it.
//
// The program writes exactly that one emoji to /output/entry.txt, with no
// trailing newline and no other bytes, then reads the file back and
// verifies it is byte-identical to what was written.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The entry: U+1F604 GRINNING FACE WITH SMILING EYES.
//
// Reconsidered once against the judge's brief before settling here:
//   - 🥰 reads warmer at a glance but its hearts carry affection a
//     stranger could read as intimate or flirty (criterion 5 counts
//     against it from someone unknown).
//   - 😊 is warm and universal but is the first smiley that comes to
//     mind, so criterion 4 (chosen rather than default) counts against it.
//   - 🌻 / 🌞 are cheerful and chosen, but they do not smile back —
//     criterion 1 is about the emoji most likely to make a stranger
//     smile, and a face grinning back at you does that directly.
// 😄 keeps the big, genuine, unguarded smile with none of those
// downsides: joyful, friendly, instantly readable at any age, and
// warm without intimacy.
const EMOJI = "😄";

// The output path the competition's gate reads.
const OUTPUT_PATH = "/output/entry.txt";

function countGraphemes(text: string): number {
  // One emoji must be exactly one grapheme cluster.
  return [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)].length;
}

function validate(text: string): void {
  if (text.length === 0) {
    throw new Error("entry is empty");
  }
  if (text.trim().length === 0) {
    throw new Error("entry is only white space");
  }
  const chars = [...text];
  if (chars.length !== 1) {
    // Spread iterates code points: a single astral-plane emoji is one.
    throw new Error(`entry must be exactly one emoji, got ${chars.length} code points`);
  }
  if (countGraphemes(text) !== 1) {
    throw new Error("entry must be exactly one grapheme cluster");
  }
  // Reject anything that is not a pictographic emoji.
  if (!/\p{Extended_Pictographic}/u.test(text)) {
    throw new Error("entry is not an emoji");
  }
  if (Buffer.byteLength(text, "utf8") > 8) {
    throw new Error("entry exceeds the 8-byte gate limit");
  }
}

validate(EMOJI);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, EMOJI, "utf8");

// Read it back and verify byte-identical: what the judge sees must be
// exactly the emoji above, nothing more and nothing less. Compare raw
// bytes, not just decoded strings, so an encoding slip cannot hide.
const readBackBytes = readFileSync(OUTPUT_PATH);
const expectedBytes = Buffer.from(EMOJI, "utf8");
if (!readBackBytes.equals(expectedBytes)) {
  throw new Error(
    `read-back mismatch: wrote bytes ${expectedBytes.toString("hex")} ` +
    `but read ${readBackBytes.toString("hex")}`,
  );
}
const readBack = readBackBytes.toString("utf8");
validate(readBack);

console.log(`Wrote exactly one emoji to ${OUTPUT_PATH}: ${EMOJI}`);
