import embeddingCache from "./embeddingCache";
import { CosineSimilarPairings, Pairings } from "./types";
import * as tf from "@tensorflow/tfjs";
import { Tensor2D, tensor2d } from "@tensorflow/tfjs";

export default async function computeCosinePairings(
  pairings: Pairings,
  embeddingSize: number,
  matMul?: Tensor2D
): Promise<CosineSimilarPairings> {
  const res = tf.tidy(() => {
    const packedA = tensor2d(
      pairings.map((p) => embeddingCache.getEmbeddingFast(p.text_1))
    ).matMul(matMul ? matMul : tf.eye(embeddingSize));
    const packedB = tensor2d(
      pairings.map((p) => embeddingCache.getEmbeddingFast(p.text_2))
    ).matMul(matMul ? matMul : tf.eye(embeddingSize));
    const proximities = tf.metrics.cosineProximity(packedA, packedB).mul(-1);
    return proximities.arraySync() as number[];
  });

  return pairings.map((pairing, i) => ({ ...pairing, similarity: res[i] }));
}
