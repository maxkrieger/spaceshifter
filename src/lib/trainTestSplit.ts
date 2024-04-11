import { Pairings } from "../types";
import { sortBy, shuffle } from "lodash";

export default function trainTestSplit(
  pairs: Pairings,
  testFraction: number
): { train: Pairings; test: Pairings } {
  // We sort to stratify proportionally
  const sorted = sortBy(pairs, ["label"]);
  const sortedTrain: Pairings = [];
  const sortedTest: Pairings = [];
  const multiple = Math.floor(1 / testFraction);
  for (let i = 0; i < pairs.length; i++) {
    if (i % multiple === 0) {
      sortedTest.push(sorted[i]);
    } else {
      sortedTrain.push(sorted[i]);
    }
  }
  const shuffledTrain = shuffle(sortedTrain);
  const shuffledTest = shuffle(sortedTest);
  return { train: shuffledTrain, test: shuffledTest };
}
