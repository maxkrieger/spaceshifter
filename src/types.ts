import { Tensor1D, Tensor2D, data, TensorContainer } from "@tensorflow/tfjs";
import { defaultEmbeddingModel } from "./lib/const";

export type EmbeddingCacheData = { [key: string]: number[] };

export type Pairing = {
  text_1: string;
  text_2: string;
  label: -1 | 1;
};

export type Pairings = Pairing[];

export type TensorDataset = {
  e1: Tensor2D;
  e2: Tensor2D;
  labels: Tensor1D;
  embeddingSize: number;
  tfDataset: data.Dataset<TensorContainer>;
};

export type DatasetSlice = {
  e1: Tensor2D;
  e2: Tensor2D;
  labels: Tensor1D;
};

// [cosine similarity, label]
export type CosinePairings = [number, number][];

export type OptimizerType = "gradient" | "adamax";
export interface OptimizationParameters {
  dropoutFraction: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
  targetEmbeddingSize: number;
  optimizer: OptimizerType;
  generateSyntheticNegatives: boolean;
  testSplitFraction: number;
  embeddingModel: string;
}

export const defaultOptimizationParameters: OptimizationParameters = {
  dropoutFraction: 0.2,
  learningRate: 0.01,
  epochs: 30,
  batchSize: 10,
  targetEmbeddingSize: 1536,
  optimizer: "adamax",
  generateSyntheticNegatives: true,
  testSplitFraction: 0.5,
  embeddingModel: defaultEmbeddingModel,
};

export type AccuracyAndSE = {
  accuracy: number;
  se: number;
  message: string;
};

export type PerformanceGroup = {
  testCosinePairings: CosinePairings;
  trainCosinePairings: CosinePairings;
  testAccuracyAndSE: AccuracyAndSE;
  trainAccuracyAndSE: AccuracyAndSE;
};

type DatasetInitializer = {
  parameters: OptimizationParameters;
  pairings: Pairings;
};
export type LocalDatasetInitializer = {
  apiKey: string;
} & DatasetInitializer;
export type ExampleDatasetInitializer = {
  cacheUrl: string;
} & DatasetInitializer;

export type MessageToTrainer =
  | ({
      type: "initializeLocalDataset";
    } & LocalDatasetInitializer)
  | ({
      type: "initializeExampleDataset";
    } & ExampleDatasetInitializer)
  | {
      type: "train";
      parameters: OptimizationParameters;
    }
  | { type: "getEmbeddingCache" };

export type MessageFromTrainer =
  | { type: "fetchingStatus"; status: "complete" | "fetching" }
  | {
      type: "embeddingProgress";
      progress: number;
    }
  | {
      type: "initialPerformance";
      performance: PerformanceGroup;
    }
  | {
      type: "updatedPerformance";
      performance: PerformanceGroup;
      epoch: number;
    }
  | {
      type: "doneTraining";
      matrixNpy: ArrayBuffer;
      shape: [number, number];
    }
  | { type: "error"; message: string }
  | { type: "dumpEmbeddingCache"; cache: EmbeddingCacheData };

export type DatasetLocator =
  | { type: "local"; id: number }
  | {
      type: "example";
      embeddingsURL: string;
      datasetURL: string;
      name: string;
    };

export type CurrentDataset =
  | {
      type: "local";
      id: number;
    }
  | {
      type: "example";
      embeddingsURL: string;
      name: string;
      pairings: Pairings;
    }
  | { type: "none" };

export type PerformanceHistory = {
  test: AccuracyAndSE;
  train: AccuracyAndSE;
}[];
