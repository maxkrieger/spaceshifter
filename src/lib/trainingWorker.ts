import { Tensor2D, getBackend, ready as tf_ready } from "@tensorflow/tfjs";
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
  async setPairings(
    pairs: Pairings,
    params: OptimizationParameters,
    embedCacheUrl?: string
  ) {
    await tf_ready();
    if (!embedCacheUrl) {
      await this.embeddingCache!.bulkEmbed(pairs);
    } else {
      await this.fetchPrecomputedEmbeddings(embedCacheUrl);
    }
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

  async fetchPrecomputedEmbeddings(url: string) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Transfer-Encoding": "chunked",
      },
    });
    const reader = res.body!.getReader();
    let receivedLength = 0;
    let maxchunks = 600;
    const chunks = [];
    while (true) {
      if (chunks.length > maxchunks - 100) {
        maxchunks *= 2;
      }
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      receivedLength += value!.length;
      sendMessageToHost({
        type: "embeddingProgress",
        total: maxchunks,
        progress: chunks.length / maxchunks,
      });
    }
    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    const result = new TextDecoder("utf-8").decode(allChunks);

    const json = JSON.parse(result);

    if (this.embeddingCache) {
      this.embeddingCache.cache = { ...this.embeddingCache.cache, ...json };
    } else {
      throw new Error("Embedding cache not initialized");
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
}

const trainer = new Trainer();

addEventListener("message", async (e: MessageEvent<TrainerMessage>) => {
  try {
    switch (e.data.type) {
      case "setApiKey":
        trainer.embeddingCache.apiKey = e.data.apiKey;
        break;
      case "setPairings":
        await trainer.setPairings(
          e.data.allPairings,
          e.data.parameters,
          e.data.cacheUrl
        );
        break;
      case "train":
        await trainer.train(e.data.parameters);
        break;
      case "getEmbeddingCache":
        sendMessageToHost({
          type: "dumpEmbeddingCache",
          cache: trainer.embeddingCache?.cache ?? {},
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
