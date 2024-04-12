import { Tensor2D, getBackend, ready as tf_ready } from "@tensorflow/tfjs";
import EmbeddingCache from "./EmbeddingCache";
import accuracyAndSE from "../lib/accuracyAndSE";
import computeCosinePairings from "../lib/cosinePairings";
import { makeMatrix, trainMatrix } from "../lib/model";
import pairingToDataset from "../lib/pairingToDataset";
import {
  EmbeddingCacheData,
  OptimizationParameters,
  Pairings,
  PerformanceGroup,
  TensorDataset,
  MessageToTrainer,
} from "../types";
import { tfToNp } from "../lib/tfToNp";
import trainTestSplit from "../lib/trainTestSplit";
import augmentNegatives from "../lib/augmentNegatives";
import { sendMessageToHost } from "./workerUtil";
import log from "loglevel";

if (import.meta.env.PROD) {
  log.setLevel(log.levels.WARN);
} else {
  log.setLevel(log.levels.DEBUG);
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

  async initDatasets({
    pairings,
    parameters,
  }: {
    pairings: Pairings;
    parameters: OptimizationParameters;
  }) {
    let { train, test } = trainTestSplit(
      pairings,
      parameters.testSplitFraction
    );
    if (parameters.generateSyntheticNegatives) {
      // We do not store these long-term because of the risk of leakage between train and test
      train = augmentNegatives(train);
      test = augmentNegatives(test);
    }
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
      console.log("foo", e);
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
    // Note we send the matrix as a transferable object
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
          e.data.pairings,
          e.data.apiKey,
          e.data.parameters.embeddingModel
        );
        await trainer.initDatasets({
          pairings: e.data.pairings,
          parameters: e.data.parameters,
        });
        break;
      case "initializeExampleDataset":
        await trainer.fetchPrecomputedEmbeddings(e.data.cacheUrl);
        await trainer.initDatasets({
          pairings: e.data.pairings,
          parameters: e.data.parameters,
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
        throw new Error("Unknown message type " + e.data);
    }
  } catch (e) {
    console.log("bar", e);
    sendMessageToHost({ type: "error", message: (e as Error).toString() });
  }
});
