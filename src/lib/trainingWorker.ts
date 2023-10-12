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

export function sendMessageToHost(message: OutboundMessage) {
  postMessage(message);
}
class Trainer {
  trainingPairings?: Pairings;
  testPairings?: Pairings;
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
  async setPairings(
    trainingAugmented: Pairings,
    testAugmented: Pairings,
    trainingOrig: Pairings,
    testOrig: Pairings
  ) {
    this.trainingPairings = trainingAugmented;
    this.testPairings = testAugmented;
    await this.embeddingCache!.bulkEmbed(testOrig);
    await this.embeddingCache!.bulkEmbed(trainingOrig);
    this.trainDataset = pairingToDataset(
      this.trainingPairings,
      this.embeddingCache!
    );
    this.testDataset = pairingToDataset(
      this.testPairings,
      this.embeddingCache!
    );

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

    for await (const _ of trainMatrix(this.trainDataset!, parameters, matrix)) {
      const perf = await this.getPerformance(matrix as Tensor2D);
      sendMessageToHost({ type: "updatedPerformance", performance: perf });
    }
    const arr = await matrix.array();
    sendMessageToHost({ type: "doneTraining", matrix: arr as number[][] });
    matrix.dispose();
    return arr;
  }
}

const trainer = new Trainer();

addEventListener("message", async (e: MessageEvent<TrainerMessage>) => {
  switch (e.data.type) {
    case "setApiKey":
      trainer.embeddingCache = new EmbeddingCache(e.data.apiKey);
      break;
    case "setPairings":
      await trainer.setPairings(
        e.data.trainingAugmented,
        e.data.testAugmented,
        e.data.trainingOrig,
        e.data.testOrig
      );
      sendMessageToHost({ type: "doneEmbedding" });
      break;
    case "train":
      await trainer.train(e.data.parameters);
      break;
    default:
      console.error("Unknown message type", e.data);
      break;
  }
});
