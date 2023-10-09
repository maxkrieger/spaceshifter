import { useCallback, useState } from "react";
import { CosineSimilarPairings, Pairings } from "../lib/types";
import trainTestSplit from "../lib/trainTestSplit";
import augmentNegatives from "../lib/augmentNegatives";
import embeddingCache from "../lib/embeddingCache";
import Histogram from "./Histogram";
import computeCosinePairings from "../lib/cosinePairings";
import accuracyAndSE from "../lib/accuracyAndSE";

export default function Trainer() {
  const [cosinePairings, setCosinePairings] =
    useState<CosineSimilarPairings | null>(null);
  const doTrain = useCallback(() => {
    (async () => {
      const res = await fetch("/hotpot.json");
      const pairings = (await res.json()) as Pairings;
      const { train, test } = trainTestSplit(pairings, 0.2);
      const augmentedTrain = augmentNegatives(train, 1);
      const augmentedTest = augmentNegatives(test, 1);
      await embeddingCache.bulkEmbed(train);
      await embeddingCache.bulkEmbed(test);
      const cosP = await computeCosinePairings(augmentedTrain);
      setCosinePairings(cosP);
      console.log(accuracyAndSE(cosP));
    })();
  }, []);
  return (
    <div>
      <h1>Trainer</h1>
      <button onClick={doTrain}>Train</button>
      {cosinePairings !== null && <Histogram pairings={cosinePairings} />}
    </div>
  );
}
