import { Tensor2D, getBackend, ready as tf_ready } from "@tensorflow/tfjs";
import EmbeddingCache from "./EmbeddingCache";
import accuracyAndSE from "./accuracyAndSE";
import computeCosinePairings from "./cosinePairings";
import { makeMatrix, trainMatrix } from "./model";
import pairingToDataset from "./pairingToDataset";
import {
  EmbeddingCacheData,
  OptimizationParameters,
  OutboundMessage,
  Pairings,
  PerformanceGroup,
  TensorDataset,
  TrainerMessage,
} from "../types";
import augmentNegatives from "./augmentNegatives";
import trainTestSplit from "./trainTestSplit";
import { tfToNp } from "./tfToNp";

function sendMessageToHost(message: OutboundMessage) {
  postMessage(message);
}

class Trainer {
  trainDataset?: TensorDataset;
  testDataset?: TensorDataset;
  embeddingCache: EmbeddingCache = new EmbeddingCache();
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

  async initDataset(pairs: Pairings, params: OptimizationParameters) {
    const { train, test } = trainTestSplit(pairs, params.testSplitFraction);
    const shouldAugment = params.generateSyntheticNegatives;
    const testAugmented = shouldAugment ? augmentNegatives(test) : test;
    const trainAugmented = shouldAugment ? augmentNegatives(train) : train;

    await tf_ready();
    this.trainDataset = pairingToDataset(trainAugmented, this.embeddingCache!);
    this.testDataset = pairingToDataset(testAugmented, this.embeddingCache!);

    sendMessageToHost({
      type: "initialPerformance",
      performance: await this.getPerformance(),
    });
  }

  async embedLocalPairings(pairs: Pairings, apiKey: string, model?: string) {
    await this.embeddingCache!.bulkEmbed(pairs, apiKey, model);
  }

  async fetchPrecomputedEmbeddings(url: string) {
    try {
      sendMessageToHost({ type: "fetchingStatus", status: "fetching" });
      const res = await fetch(url, {
        method: "GET",
      });

      const json = (await res.json()) as EmbeddingCacheData;

      if (this.embeddingCache) {
        this.embeddingCache.addToCache(json);
        sendMessageToHost({ type: "fetchingStatus", status: "complete" });
      } else {
        throw new Error("Embedding cache not initialized");
      }
    } catch (e) {
      sendMessageToHost({ type: "error", message: (e as Error).toString() });
    }
  }

  async train(parameters: OptimizationParameters) {
    if (getBackend() !== "webgl") {
      sendMessageToHost({
        type: "error",
        message:
          "Your browser doesn't support worker WebGL, try Chrome. It will be slow otherwise!",
      });
    }
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

  getEmbeddingCache() {
    return this.embeddingCache.getCache();
  }
}

const trainer = new Trainer();

addEventListener("message", async (e: MessageEvent<TrainerMessage>) => {
  try {
    switch (e.data.type) {
      case "initializeLocalDataset":
        await trainer.embedLocalPairings(
          e.data.allPairings,
          e.data.apiKey,
          e.data.model
        );
        await trainer.initDataset(e.data.allPairings, e.data.parameters);
        break;
      case "initializeExampleDataset":
        await trainer.fetchPrecomputedEmbeddings(e.data.cacheUrl);
        await trainer.initDataset(e.data.allPairings, e.data.parameters);
        break;
      case "train":
        await trainer.train(e.data.parameters);
        break;
      case "getEmbeddingCache":
        sendMessageToHost({
          type: "dumpEmbeddingCache",
          cache: trainer.getEmbeddingCache(),
        });
        break;
      default:
        console.error("Unknown message type", e.data);
        break;
    }
  } catch (e: unknown) {
    sendMessageToHost({ type: "error", message: (e as Error).toString() });
  }
});
