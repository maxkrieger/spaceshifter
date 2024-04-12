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
 * Trainer worker does not exist. Accepts a local or example dataset to transition to get embeddings
 */
export type Uninitialized = UninitializedState & {
  initializeLocal: (options: LocalDatasetInitializer) => void;
  initializeExample: (initializer: ExampleDatasetInitializer) => void;
};

/**
 * Fetching precomputed embeddings for an example
 */
export type FetchingEmbeddings = FetchingEmbeddingsState & Resettable;

/**
 * Embedding new data and caching it
 */
export type EmbeddingProgress = EmbeddingProgressState & Resettable;

/**
 * Pretraining has been completed and the model can be trained
 */
export type Pretraining = PretrainingState &
  EmbeddingsDownloadable &
  Trainable &
  Resettable;

/**
 * First state from training, before the first epoch
 */
export type TrainingStarted = TrainingStartedState &
  EmbeddingsDownloadable &
  Resettable;

/**
 * Training in progress
 */
export type Training = TrainingState & EmbeddingsDownloadable & Resettable;

/**
 * Training complete
 */
export type DoneTraining = DoneTrainingState &
  EmbeddingsDownloadable &
  Trainable &
  Resettable;

/**
 * Represents a stateful API for the training worker.
 * Different states have different callbacks available.
 */
export type TrainerAPI =
  | Uninitialized
  | FetchingEmbeddings
  | EmbeddingProgress
  | Pretraining
  | TrainingStarted
  | Training
  | DoneTraining;

/**
 * Holds a pointer to the training worker
 */
export const trainingWorkerAtom = atom<TrainingWorkerClient | null>(null);

/**
 * Holds the current internal state of the trainer hook
 */
export const trainingStateAtom = atom<TrainerState>({ type: "uninitialized" });
