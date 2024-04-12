import {
  ExampleDatasetInitializer,
  LocalDatasetInitializer,
  OptimizationParameters,
  PerformanceGroup,
  PerformanceHistory,
} from "@/types";
import TrainingWorkerClient from "@/worker/TrainingWorkerClient";
import { atom } from "jotai";

type BestMatrix = {
  matrixNpy: ArrayBuffer;
  shape: [number, number];
};

type UninitializedState = {
  type: "uninitialized";
};

type FetchingEmbeddingsState = {
  type: "fetchingEmbeddings";
};

type EmbeddingProgressState = {
  type: "embeddingProgress";
  progress: number;
};

type PretrainingState = {
  type: "pretrained";
  pretrainingPerformance: PerformanceGroup;
};

type TrainingStartedState = {
  type: "trainingStarted";
  currentEpoch: 0;
  pretrainingPerformance: PerformanceGroup;
};

export type TrainingArtifacts = {
  performanceHistory: PerformanceHistory;
  currentPerformance: PerformanceGroup;
  pretrainingPerformance: PerformanceGroup;
};

type TrainingState = {
  type: "training";
  currentEpoch: number;
} & TrainingArtifacts;

type DoneTrainingState = {
  type: "doneTraining";
  bestMatrix: BestMatrix;
} & TrainingArtifacts;

/**
 * Represents all possible states the training worker can be in
 */
type TrainerState =
  | UninitializedState
  | FetchingEmbeddingsState
  | EmbeddingProgressState
  | PretrainingState
  | TrainingStartedState
  | TrainingState
  | DoneTrainingState;

export const trainingWorkerAtom = atom<TrainingWorkerClient | null>(null);
export const trainingStateAtom = atom<TrainerState>({ type: "uninitialized" });

type EmbeddingsDownloadable = {
  /**
   * Retrieves the embeddings cache for download
   */
  downloadEmbeddings: () => void;
};

type Trainable = {
  /**
   * Begins a training run
   */
  train: (parameters: OptimizationParameters) => void;
};

type Resettable = {
  /**
   * Resets the trainer state and terminates the training loop
   */
  reset: () => void;
};

/**
 * Represents a stateful API for the training worker.
 * Different states have different callbacks available.
 */
export type TrainerAPI =
  | (UninitializedState & {
      initializeLocal: (options: LocalDatasetInitializer) => void;
      initializeExample: (initializer: ExampleDatasetInitializer) => void;
    })
  | ((
      | FetchingEmbeddingsState
      | EmbeddingProgressState
      | (PretrainingState & EmbeddingsDownloadable & Trainable)
      | (TrainingStartedState & EmbeddingsDownloadable)
      | (TrainingState & EmbeddingsDownloadable)
      | (DoneTrainingState & EmbeddingsDownloadable & Trainable)
    ) &
      Resettable);
