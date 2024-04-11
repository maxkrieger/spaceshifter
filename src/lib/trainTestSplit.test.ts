import {expect, test} from "vitest";
import {Pairings} from "@/types";
import trainTestSplit from "./trainTestSplit";

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
  {
    text_1: "The capital of Zimbabwe is",
    text_2: "Harare",
    label: 1,
  },
];

test("Splitting 6 pairings equally", () => {
  const {train, test} = trainTestSplit(testPairings, 0.5);
  expect(train.length).toBe(3);
  expect(test.length).toBe(3);
});
test("Splitting 3 pairings", () => {
  const {train, test} = trainTestSplit(testPairings.slice(0, 3), 0.5);
  expect(train.length).toBe(1);
  expect(test.length).toBe(2);
});

test("Splitting 1 pairing", () => {
  const {train, test} = trainTestSplit(testPairings.slice(0, 1), 0.5);
  expect(train.length).toBe(0);
  expect(test.length).toBe(1);
});
test("Splitting 2 pairings", () => {
  const {train, test} = trainTestSplit(testPairings.slice(0, 2), 0.5);
  expect(train.length).toBe(1);
  expect(test.length).toBe(1);
});

