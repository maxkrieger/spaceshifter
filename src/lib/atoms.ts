import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import TrainingWorkerClient from "./TrainingWorkerClient";
import { AccuracyAndSE, PerformanceGroup, ProjectLocator } from "./types";

export const apiKeyAtom = atomWithStorage<string | null>("api-key", null);

export const trainingWorkerAtom = atom<TrainingWorkerClient | null>(null);

export const performanceHistoryAtom = atom<
  { train: AccuracyAndSE; test: AccuracyAndSE }[]
>([]);

export const currentPerformanceAtom = atom<PerformanceGroup | null>(null);
export const initialPerformanceAtom = atom<PerformanceGroup | null>(null);

export const currentProjectAtom = atom<ProjectLocator | null>(null);
