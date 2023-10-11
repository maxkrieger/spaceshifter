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
        const { train, test } = trainTestSplit(pairings, 0.5);
        const augmentedTrain = augmentNegatives(train, 1);
        // How many are in each????
        const augmentedTest = augmentNegatives(test, 1);
        console.log(
          augmentedTest.filter((p) => p.label === 1).length,
          augmentedTest.filter((p) => p.label === -1).length
        );
        await embeddingCache.bulkEmbed(train);
        await embeddingCache.bulkEmbed(test);
        const cosP = await computeCosinePairings(augmentedTest, 1536);
        setCosinePairings(cosP);
        console.log(accuracyAndSE(cosP));
        for await (const mat of trainMatrix(augmentedTrain)) {
          const cosPT = await computeCosinePairings(augmentedTest, 1536, mat);
          console.log("test", cosPT[0].label, cosPT[0].similarity);
          setCosinePairings(cosPT);
          console.log("test", accuracyAndSE(cosPT));
          const cosss = await computeCosinePairings(augmentedTrain, 1536, mat);
          console.log("train", cosss[0].label, cosss[0].similarity);
          console.log("train", accuracyAndSE(cosss));
        }
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
