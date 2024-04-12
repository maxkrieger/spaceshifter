import { atomWithStorage, loadable } from "jotai/utils";
import { atom } from "jotai";
import { CurrentDataset } from "../types";

export const apiKeyAtom = atomWithStorage<string | null>("api-key", null);

export const currentDatasetAtom = atom<CurrentDataset>({ type: "none" });

const _modelsAtom = atom<Promise<string[]>>(async (get) => {
  const apiKey = get(apiKeyAtom);
  if (!apiKey) {
    return [];
  }
  const res = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (res.status !== 200) {
    return [];
  }
  const json = (await res.json()) as unknown as {
    data: { id: string }[];
  };
  const embeddingModels = json.data
    .filter(({ id }) => id.startsWith("text-embedding"))
    .map(({ id }) => id);
  embeddingModels.sort().reverse();
  return embeddingModels;
});

export const modelsAtom = loadable(_modelsAtom);
