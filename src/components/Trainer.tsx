import { useCallback, useState } from "react";
import { CosinePairings, OptimizationParameters, Pairings } from "../lib/types";
import trainTestSplit from "../lib/trainTestSplit";
import augmentNegatives from "../lib/augmentNegatives";
import Histogram from "./Histogram";
import { isValidJSON } from "../lib/validator";

export default function Trainer() {
  const doTrain = useCallback(() => {
    (async () => {
      if (apiKey === null) {
        throw new Error("API key is null");
      }
      const workerClient = new TrainingWorkerClient(apiKey, (message) => {
        console.log(message);
        switch (message.type) {
          case "doneEmbedding":
            break;

          default:
            console.log(message);
            break;
        }
      });
      const res = await fetch("/nmnli.json");
      const pairings = await res.json();
      if (isValidJSON(pairings)) {
        const { train, test } = trainTestSplit(pairings, 0.5);
        const augmentedTrain = augmentNegatives(train, 1);
        const augmentedTest = augmentNegatives(test, 1);
        console.log("sending");
        workerClient.sendMessage({
          type: "setPairings",
          testOrig: test,
          trainingOrig: train,
          testAugmented: augmentedTest,
          trainingAugmented: augmentedTrain,
        });

        const parameters: OptimizationParameters = {
          dropoutFraction: 0.2,
          learningRate: 10,
          epochs: 100,
          batchSize: 10,
          targetEmbeddingSize: 2048,
          optimizer: "gradient",
        };
        /*const matrix = makeMatrix(
          trainDataset.embeddingSize,
          parameters.targetEmbeddingSize
        );
        for await (const loss of gradientDescentOptimize(
          trainDataset,
          parameters,
          matrix
        )) {
          console.log(loss);
          const cosPT = await computeCosinePairings(
            testDataset,
            matrix as Tensor2D
          );
          setCosinePairings(cosPT);
          console.log("test", accuracyAndSE(cosPT));
          console.log(
            "train",
            accuracyAndSE(
              await computeCosinePairings(trainDataset, matrix as Tensor2D)
            )
          );
        }*/
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
