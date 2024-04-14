import { expect, test } from "vitest";
import accuracyAndSE from "./accuracyAndSE";
import accuracyAndSEGroundtruth from "../../test/fixtures/cities_accuracy_and_se.json";
import cosinePairingsFixture from "../../test/fixtures/cities_cosine_pairings.json";
import { CosinePairings } from "@/types";

test("accuracyAndSE should produce groundtruth values within some decimal places", () => {
  const { accuracy, se, message } = accuracyAndSE(
    cosinePairingsFixture as unknown as CosinePairings
  );
  expect(
    accuracy,
    "accuracy is within 5 decimal places of groundtruth"
  ).toBeCloseTo(accuracyAndSEGroundtruth.accuracy, 5);

  expect(se, "se is within 3 decimal places of groundtruth").toBeCloseTo(
    accuracyAndSEGroundtruth.se,
    3
  );
  expect(message, "message is equal to groundtruth").toBe(
    accuracyAndSEGroundtruth.message
  );
});
