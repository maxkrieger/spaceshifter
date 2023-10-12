import { Tensor1D, Tensor2D, data, TensorContainer } from "@tensorflow/tfjs";
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

export interface OptimizationParameters {
  dropoutFraction: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
  targetEmbeddingSize: number;
  optimizer: "gradient" | "adamax";
}

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

export type TrainerMessage =
  | {
      type: "setApiKey";
      apiKey: string;
    }
  | {
      type: "setPairings";
      trainingAugmented: Pairings;
      testAugmented: Pairings;
      trainingOrig: Pairings;
      testOrig: Pairings;
    }
  | {
      type: "train";
      parameters: OptimizationParameters;
    };

export type OutboundMessage =
  | {
      type: "doneEmbedding";
    }
  | {
      type: "embeddingProgress";
      progress: number;
      total: number;
    }
  | {
      type: "initialPerformance";
      performance: PerformanceGroup;
    }
  | {
      type: "updatedPerformance";
      performance: PerformanceGroup;
    }
  | {
      type: "doneTraining";
      matrix: number[][];
    };

export type ProjectLocator =
  | { type: "local"; id: number }
  | { type: "example"; route: string; name: string };
