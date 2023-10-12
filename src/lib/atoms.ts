import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import TrainingWorkerClient from "./TrainingWorkerClient";
import {
  AccuracyAndSE,
  PerformanceGroup,
  DatasetLocator,
  ProjectPhase,
} from "./types";

export const apiKeyAtom = atomWithStorage<string | null>("api-key", null);

export const trainingWorkerAtom = atom<TrainingWorkerClient | null>(null);

export const performanceHistoryAtom = atom<
  { train: AccuracyAndSE; test: AccuracyAndSE }[]
>([]);

export const currentPerformanceAtom = atom<PerformanceGroup | null>(null);
export const initialPerformanceAtom = atom<PerformanceGroup | null>(null);

export const currentDatasetAtom = atom<DatasetLocator | null>(null);

export const projectPhaseAtom = atom<ProjectPhase>(ProjectPhase.NoData);
