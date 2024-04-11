import { atomWithStorage, loadable } from "jotai/utils";
import { atom } from "jotai";
import TrainingWorkerClient from "./TrainingWorkerClient";
import {
  ProjectPhase,
  OptimizationParameters,
  defaultOptimizationParameters,
  PerformanceGroup,
  CurrentDataset,
} from "../types";

export const apiKeyAtom = atomWithStorage<string | null>("api-key", null);

export const trainingWorkerAtom = atom<TrainingWorkerClient | null>(null);

export const currentDatasetAtom = atom<CurrentDataset>({ type: "none" });

export const projectPhaseAtom = atom<ProjectPhase>(ProjectPhase.NoData);

export const pretrainingPerformanceAtom = atom<PerformanceGroup | null>(null);

export const bestMatrixAtom = atom<{
  matrixNpy: ArrayBuffer;
  shape: [number, number];
} | null>(null);

export const exampleParametersAtom = atom<OptimizationParameters>(
  defaultOptimizationParameters
);

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
