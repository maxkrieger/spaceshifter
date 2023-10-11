import embeddingCache from "./embeddingCache";
import { CosineSimilarPairings, Pairings } from "./types";
import * as tf from "@tensorflow/tfjs";
import log from "loglevel";
import { Tensor2D, tensor2d } from "@tensorflow/tfjs";

export default async function computeCosinePairings(
  pairings: Pairings,
  embeddingSize: number,
  matMul?: Tensor2D
): Promise<CosineSimilarPairings> {
  log.info("Computing cosine pairings...");
  const packedA = tensor2d(
    await Promise.all(
      pairings.map(
        async (p) => (await embeddingCache.getEmbeddingLocally(p.text_1))!
      )
    )
  ).matMul(matMul ? matMul : tf.eye(embeddingSize));
  const packedB = tensor2d(
    await Promise.all(
      pairings.map(
        async (p) => (await embeddingCache.getEmbeddingLocally(p.text_2))!
      )
    )
  ).matMul(matMul ? matMul : tf.eye(embeddingSize));
  const proximities = await tf.metrics
    .cosineProximity(packedA, packedB)
    .mul(-1);
  const arr = proximities.arraySync() as number[];

  log.info("Done computing cosine pairings");
  return pairings.map((pairing, i) => ({ ...pairing, similarity: arr[i] }));
}
