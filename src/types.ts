import { Tensor1D, Tensor2D, data, TensorContainer } from "@tensorflow/tfjs";
import { defaultEmbeddingModel } from "./lib/const";

/**
 * Maps a piece of text to its embedding
 */
export type EmbeddingCacheData = { [key: string]: number[] };

/**
 * A point of training data
 * @property text_1 - The first piece of text
 * @property text_2 - The second piece of text
 * @property label - The label. -1 for negative ("far apart"), 1 for positive ("close together")
 */
export type Pairing = {
  text_1: string;
  text_2: string;
  label: -1 | 1;
};

/**
 * A list of training data
 */
export type Pairings = Pairing[];

/**
 * A tfjs dataset
 * @property e1 - A tensor of embeddings for the first piece of text
 * @property e2 - A tensor of embeddings for the second piece of text
 * @property labels - A tensor of labels
 * @property embeddingSize - The size (in parameters) of the embeddings
 * @property tfDataset - The "zipped-up" tfjs dataset composed of the tensors
 */
export type TensorDataset = {
  e1: Tensor2D;
  e2: Tensor2D;
  labels: Tensor1D;
  embeddingSize: number;
  tfDataset: data.Dataset<TensorContainer>;
};

/**
 * A subset of @TensorDataset
 * Used for batching
 */
export type DatasetSlice = {
  e1: Tensor2D;
  e2: Tensor2D;
  labels: Tensor1D;
};

/**
 * A list of pairing similarities and groundtruth labels
 * @property 0 - The observed cosine similarity between the two embeddings
 * @property 1 - The groundtruth label. -1 for negative ("far apart"), 1 for positive ("close together")
 */
export type CosinePairings = [number, number][];

export type OptimizerType = "gradient" | "adamax";

/**
 * Parameters for training the model
 */
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

/**
 * Accuracy and standard error, as well as a human-readable rendering.
 */
export type AccuracyAndSE = {
  accuracy: number;
  se: number;
  message: string;
};

/**
 * All performance metrics for a given matrix.
 * Including the distribution of cosine similarities across datapoints.
 */
export type PerformanceGroup = {
  testCosinePairings: CosinePairings;
  trainCosinePairings: CosinePairings;
  testAccuracyAndSE: AccuracyAndSE;
  trainAccuracyAndSE: AccuracyAndSE;
};

/**
 * Common elements for initializing the trainer
 */
type DatasetInitializer = {
  parameters: OptimizationParameters;
  pairings: Pairings;
};

/**
 * Additional properties for initializing a local dataset
 */
export type LocalDatasetInitializer = {
  apiKey: string;
} & DatasetInitializer;

/**
 * Additional properties for initializing an example dataset
 */
export type ExampleDatasetInitializer = {
  cacheUrl: string;
} & DatasetInitializer;

/**
 * Message types one can send to the trainer worker
 */
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

/**
 * Messages one can receive from the trainer worker
 */
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

/**
 * A pointer to a local or example dataset
 */
export type DatasetLocator =
  | { type: "local"; id: number }
  | {
      type: "example";
      embeddingsURL: string;
      datasetURL: string;
      name: string;
    };

/**
 * A pointer to the current dataset.
 * Examples include the fetched dataset itself for convenient access.
 */
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

/**
 * For visualizing the training process.
 * Indexed by epoch.
 */
export type PerformanceHistory = {
  test: AccuracyAndSE;
  train: AccuracyAndSE;
}[];
