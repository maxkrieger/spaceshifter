import { Tensor2D } from "@tensorflow/tfjs";
import EmbeddingCache from "./EmbeddingCache";
import accuracyAndSE from "./accuracyAndSE";
import computeCosinePairings from "./cosinePairings";
import { makeMatrix, trainMatrix } from "./model";
import pairingToDataset from "./pairingToDataset";
import {
  OptimizationParameters,
  OutboundMessage,
  Pairings,
  PerformanceGroup,
  TensorDataset,
  TrainerMessage,
} from "./types";
import augmentNegatives from "./augmentNegatives";
import trainTestSplit from "./trainTestSplit";
import { tfToNp } from "./tfToNp";

function sendMessageToHost(message: OutboundMessage) {
  postMessage(message);
}

// https://github.com/propelml/tfjs-npy/blob/master/npy.ts

class Trainer {
  trainDataset?: TensorDataset;
  testDataset?: TensorDataset;
  embeddingCache?: EmbeddingCache;
  constructor() {}
  async getPerformance(mat?: Tensor2D): Promise<PerformanceGroup> {
    const testCosinePairings = await computeCosinePairings(
      this.testDataset!,
      mat
    );
    const trainCosinePairings = await computeCosinePairings(
      this.trainDataset!,
      mat
    );
    const testAccuracyAndSE = accuracyAndSE(testCosinePairings);
    const trainAccuracyAndSE = accuracyAndSE(trainCosinePairings);
    return {
      testCosinePairings,
      trainCosinePairings,
      testAccuracyAndSE,
      trainAccuracyAndSE,
    };
  }
  async setPairings(pairs: Pairings, params: OptimizationParameters) {
    await this.embeddingCache!.bulkEmbed(pairs);
    const { train, test } = trainTestSplit(pairs, params.testSplitFraction);
    const shouldAugment = params.generateSyntheticNegatives;
    const testAugmented = shouldAugment ? augmentNegatives(test, 1) : test;
    const trainAugmented = shouldAugment ? augmentNegatives(train, 1) : train;
    this.trainDataset = pairingToDataset(trainAugmented, this.embeddingCache!);
    this.testDataset = pairingToDataset(testAugmented, this.embeddingCache!);

    sendMessageToHost({
      type: "initialPerformance",
      performance: await this.getPerformance(),
    });
  }

  async train(parameters: OptimizationParameters) {
    const matrix = makeMatrix(
      this.trainDataset!.embeddingSize,
      parameters.targetEmbeddingSize
    );

    for await (const epoch of trainMatrix(
      this.trainDataset!,
      parameters,
      matrix
    )) {
      const perf = await this.getPerformance(matrix as Tensor2D);
      sendMessageToHost({
        type: "updatedPerformance",
        performance: perf,
        epoch,
      });
    }
    const converted = await tfToNp(matrix as Tensor2D);
    postMessage(
      { type: "doneTraining", matrixNpy: converted, shape: matrix.shape },
      [converted]
    );
    matrix.dispose();
  }
}

const trainer = new Trainer();

addEventListener("message", async (e: MessageEvent<TrainerMessage>) => {
  try {
    switch (e.data.type) {
      case "setApiKey":
        trainer.embeddingCache = new EmbeddingCache(e.data.apiKey);
        break;
      case "setPairings":
        await trainer.setPairings(e.data.allPairings, e.data.parameters);
        break;
      case "train":
        await trainer.train(e.data.parameters);
        break;
      default:
        console.error("Unknown message type", e.data);
        break;
    }
  } catch (e: unknown) {
    sendMessageToHost({ type: "error", message: (e as Error).toString() });
  }
});
