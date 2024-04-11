import { Pairings } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { countBy } from "lodash";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function countLabels(pairs: Pairings) {
  const { "1": positives = 0, "-1": negatives = 0 } = countBy(pairs, "label");
  return { positives, negatives };
}
