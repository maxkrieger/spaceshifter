import { EmbeddingCacheData, Pairings } from "@/types";
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

export function downloadEmbeddingCache(cache: EmbeddingCacheData) {
  const blob = new Blob([JSON.stringify(cache)], {
    type: "text/json",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.download = "embeddings.json";
  link.href = url;
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
