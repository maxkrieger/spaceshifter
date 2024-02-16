import { Pairings } from "./types";
import { partition, shuffle } from "lodash";

function keyPairing({
  text_1,
  text_2,
}: {
  text_1: string;
  text_2: string;
}): string {
  return `${text_1} ${text_2}`;
}

/**
 * Must have >1 positive example to augment negatives
 */
export default function augmentNegatives(
  pairings: Pairings,
  negativesPerPositive: number
): Pairings {
  const [positives, negatives] = partition(
    pairings,
    ({ label }) => label === 1
  );
  const negativesIndex = new Set(negatives.map(keyPairing));
  const newNegatives: Pairings = [];
  const numNegativesToCreate = Math.max(
    positives.length * negativesPerPositive - negatives.length,
    0
  );

  for (let i = 0; i < positives.length - 1; i++) {
    for (let j = i + 1; j < positives.length; j++) {
      const text_1 = positives[i].text_1;
      const text_2 = positives[j].text_2;
      if (newNegatives.length >= numNegativesToCreate) {
        break;
      }
      if (!negativesIndex.has(keyPairing({ text_1, text_2 }))) {
        newNegatives.push({ text_1, text_2, label: -1 });
        negativesIndex.add(keyPairing({ text_1, text_2 }));
      }
    }
  }
  const reversed = [...positives].reverse();
  for (let i = 0; i < reversed.length - 1; i++) {
    for (let j = i + 1; j < positives.length; j++) {
      const text_1 = reversed[i].text_1;
      const text_2 = reversed[j].text_2;
      if (newNegatives.length >= numNegativesToCreate) {
        break;
      }
      if (!negativesIndex.has(keyPairing({ text_1, text_2 }))) {
        newNegatives.push({ text_1, text_2, label: -1 });
        negativesIndex.add(keyPairing({ text_1, text_2 }));
      }
    }
  }

  return shuffle([...pairings, ...newNegatives]);
}
