import { useCallback, useState } from "react";
import { CosineSimilarPairings, Pairings } from "../lib/types";
import trainTestSplit from "../lib/trainTestSplit";
import augmentNegatives from "../lib/augmentNegatives";
import embeddingCache from "../lib/embeddingCache";
import Histogram from "./Histogram";
import computeCosinePairings from "../lib/cosinePairings";
import accuracyAndSE from "../lib/accuracyAndSE";
import { isValidJSON } from "../lib/validator";
import { trainMatrix } from "../lib/model";

export default function Trainer() {
  const [cosinePairings, setCosinePairings] =
    useState<CosineSimilarPairings | null>(null);
  const doTrain = useCallback(() => {
    (async () => {
      const res = await fetch("/nmnli.json");
      const pairings = await res.json();
      if (isValidJSON(pairings)) {
        const { train, test } = trainTestSplit(pairings, 0.2);
        const augmentedTrain = augmentNegatives(train, 1);
        const augmentedTest = augmentNegatives(test, 1);
        await embeddingCache.bulkEmbed(train);
        await embeddingCache.bulkEmbed(test);
        const cosP = await computeCosinePairings(augmentedTrain);
        setCosinePairings(cosP);
        console.log(accuracyAndSE(cosP));
        await trainMatrix(augmentedTrain, augmentedTest);
      } else {
        console.error("Invalid JSON");
      }
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
