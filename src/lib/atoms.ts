import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import TrainingWorkerClient from "./TrainingWorkerClient";
import {
  DatasetLocator,
  ProjectPhase,
  OptimizationParameters,
  defaultOptimizationParameters,
  Pairings,
} from "./types";

export const apiKeyAtom = atomWithStorage<string | null>("api-key", null);

export const trainingWorkerAtom = atom<TrainingWorkerClient | null>(null);

export const currentDatasetAtom = atom<DatasetLocator | null>(null);

export const projectPhaseAtom = atom<ProjectPhase>(ProjectPhase.NoData);

export const bestMatrixAtom = atom<{
  matrixNpy: ArrayBuffer;
  shape: [number, number];
} | null>(null);

export const exampleParametersAtom = atom<OptimizationParameters>(
  defaultOptimizationParameters
);

export const exampleDatasetAtom = atom<Pairings>([]);
