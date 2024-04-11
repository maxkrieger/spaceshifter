import { expect, test } from "vitest";
import { Pairings } from "./types";
import augmentNegatives from "./augmentNegatives";
import { partition } from "lodash";

const testPairings: Pairings = [
  {
    text_1: "The capital of Egypt is",
    text_2: "Cairo",
    label: 1,
  },
  {
    text_1: "The capital of France is",
    text_2: "Paris",
    label: 1,
  },
  {
    text_1: "The capital of Indonesia is",
    text_2: "Jakarta",
    label: 1,
  },
  {
    text_1: "The capital of Argentina is",
    text_2: "Buenos Aires",
    label: 1,
  },
  {
    text_1: "The capital of Indonesia is",
    text_2: "Boston",
    label: -1,
  },
];

test("Augmenting negatives", () => {
  const augmented = augmentNegatives(testPairings);
  const [negatives, positives] = partition(
    augmented,
    ({ label }) => label === -1
  );
  expect(positives.length).toBe(negatives.length);
  for (const { text_1, text_2 } of positives) {
    expect(negatives).not.toContainEqual({ text_1, text_2, label: -1 });
    expect(negatives).not.toContainEqual({
      text_1: text_2,
      text_2: text_1,
      label: -1,
    });
  }
});
