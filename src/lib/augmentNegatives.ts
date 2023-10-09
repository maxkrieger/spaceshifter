import { Pairings } from "./types";
import { shuffle } from "lodash";

function keyPairing({
  text_1,
  text_2,
}: {
  text_1: string;
  text_2: string;
}): string {
  return `${text_1} ${text_2}`;
}

export default function augmentNegatives(
  pairings: Pairings,
  negativesPerPositive: number
): Pairings {
  const positives = pairings.filter((p) => p.label > 0);
  const positivesIndex = new Set(positives.map(keyPairing));
  const newNegatives: Pairings = [];

  const numNegativesToCreate =
    positives.length * negativesPerPositive -
    (pairings.length - positives.length);

  while (newNegatives.length < numNegativesToCreate) {
    const text_1 =
      positives[Math.floor(Math.random() * positives.length)].text_1;
    const text_2 =
      positives[Math.floor(Math.random() * positives.length)].text_2;
    if (!positivesIndex.has(keyPairing({ text_1, text_2 }))) {
      newNegatives.push({ text_1, text_2, label: -1 });
    }
  }

  return shuffle([...pairings, ...newNegatives]);
}
