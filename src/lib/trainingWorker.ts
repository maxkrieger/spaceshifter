import { Tensor2D, getBackend, ready as tf_ready } from "@tensorflow/tfjs";
import EmbeddingCache from "./EmbeddingCache";
import accuracyAndSE from "./accuracyAndSE";
import computeCosinePairings from "./cosinePairings";
import { makeMatrix, trainMatrix } from "./model";
import pairingToDataset from "./pairingToDataset";
import {
  EmbeddingCacheData,
  OptimizationParameters,
  MessageFromTrainer,
  Pairings,
  PerformanceGroup,
  TensorDataset,
  MessageToTrainer,
} from "../types";
import { tfToNp } from "./tfToNp";

function sendMessageToHost(message: MessageFromTrainer) {
  postMessage(message);
}

class Trainer {
  trainDataset?: TensorDataset;
  testDataset?: TensorDataset;
  embeddingCache: EmbeddingCache = new EmbeddingCache();
  constructor() {}
  async getPerformance(mat?: Tensor2D): Promise<PerformanceGroup> {
    if (!this.trainDataset || !this.testDataset) {
      throw new Error("Datasets not initialized");
    }
    const testCosinePairings = await computeCosinePairings(
      this.testDataset,
      mat
    );
    const trainCosinePairings = await computeCosinePairings(
      this.trainDataset,
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

  async initDatasets({ train, test }: { train: Pairings; test: Pairings }) {
    await tf_ready();
    this.trainDataset = pairingToDataset(train, this.embeddingCache);
    this.testDataset = pairingToDataset(test, this.embeddingCache);

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
    if (!this.trainDataset) {
      throw new Error("Datasets not initialized");
    }
    const matrix = makeMatrix(
      this.trainDataset.embeddingSize,
      parameters.targetEmbeddingSize
    );

    for await (const epoch of trainMatrix(
      this.trainDataset,
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

addEventListener("message", async (e: MessageEvent<MessageToTrainer>) => {
  try {
    switch (e.data.type) {
      case "initializeLocalDataset":
        await trainer.embedLocalPairings(
          e.data.testSet.concat(e.data.trainSet),
          e.data.apiKey,
          e.data.parameters.embeddingModel
        );
        await trainer.initDatasets({
          train: e.data.trainSet,
          test: e.data.testSet,
        });
        break;
      case "initializeExampleDataset":
        await trainer.fetchPrecomputedEmbeddings(e.data.cacheUrl);
        await trainer.initDatasets({
          train: e.data.trainSet,
          test: e.data.testSet,
        });
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
