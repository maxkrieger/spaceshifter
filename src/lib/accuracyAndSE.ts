import { AccuracyAndSE, CosinePairings } from "./types";
import { range, max } from "lodash";

// Adapted from https://github.com/openai/openai-cookbook/blob/main/examples/Customizing_embeddings.ipynb
export default function accuracyAndSE(pairings: CosinePairings): AccuracyAndSE {
  const accuracies = [];
  for (const threshold_thousandths of range(-1000, 1000, 1)) {
    const threshold = threshold_thousandths / 1000;
    let correct = 0;
    for (const [similarity, label] of pairings) {
      let prediction;
      if (similarity > threshold) {
        prediction = 1;
      } else {
        prediction = -1;
      }
      if (prediction === label) {
        correct += 1;
      }
    }
    const accuracy = correct / pairings.length;
    accuracies.push(accuracy);
  }
  const a = max(accuracies)!;
  const n = accuracies.length;
  const se = Math.sqrt((a * (1 - a)) / n);
  const message = `${(a * 100).toFixed(1)}% ± ${(1.96 * se * 100).toFixed(1)}%`;

  return { accuracy: a, se, message };
}
