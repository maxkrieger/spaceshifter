import { Pairing, Pairings } from "./types";
import { partition, shuffle } from "lodash";

/**
 * Hash function for a pairing
 */
function keyPairing({
  text_1,
  text_2,
}: {
  text_1: string;
  text_2: string;
}): string {
  return [text_1, text_2].sort().join("___");
}

/**
 * Returns a new set of pairings with a balanced number of positive and negative examples
 *
 * Must have >1 positive example to augment negatives
 */
export default function augmentNegatives(pairings: Pairings): Pairings {
  const allTexts = new Set<string>();
  const pairs = new Set<string>();
  for (const { text_1, text_2 } of pairings) {
    allTexts.add(text_1);
    allTexts.add(text_2);
    pairs.add(keyPairing({ text_1, text_2 }));
  }

  const texts = Array.from(allTexts);

  const augmentedNegatives: Pairing[] = [];
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const text_1 = texts[i];
      const text_2 = texts[j];
      const key = keyPairing({ text_1, text_2 });
      if (!pairs.has(key)) {
        augmentedNegatives.push({ text_1, text_2, label: -1 });
      }
    }
  }

  const [positives, negatives] = partition(
    pairings,
    ({ label }) => label === 1
  );

  return [
    ...pairings,
    ...shuffle(augmentedNegatives).slice(
      0,
      positives.length - negatives.length
    ),
  ];
}
