import embeddingCache from "./embeddingCache";
import { CosineSimilarPairings, Pairings } from "./types";
import * as tf from "@tensorflow/tfjs";
import log from "loglevel";

export default async function computeCosinePairings(
  pairings: Pairings
): Promise<CosineSimilarPairings> {
  log.info("Computing cosine pairings...");
  const res = await Promise.all(
    pairings.map(async (pairing) => {
      const tensA = (await embeddingCache.getEmbeddingLocally(pairing.text_1))!;
      const tensB = (await embeddingCache.getEmbeddingLocally(pairing.text_2))!;

      const prox = await tf.metrics.cosineProximity(tensA, tensB).data();

      return {
        ...pairing,
        similarity: -prox[0],
      };
    })
  );
  log.info("Done computing cosine pairings");
  return res;
}
