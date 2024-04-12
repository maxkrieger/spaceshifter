import { apiKeyAtom, currentDatasetAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import useParameters from "./useParameters";
import trainTestSplit from "@/lib/trainTestSplit";
import augmentNegatives from "@/lib/augmentNegatives";
import { countLabels } from "@/lib/utils";
import usePairings from "./usePairings";
import useTrainer from "./useTrainer";

/**
 * Takes a flat dataset of pairings, augments it, and sends it to a new worker
 * Provides status and dataset info
 */
export default function usePretraining(): {
  initializeDataset: () => void;
  datasetCounts: {
    positives: number;
    negatives: number;
  } | null;
} {
  const trainer = useTrainer();

  const currentDataset = useAtomValue(currentDatasetAtom);
  const pairings = usePairings();
  const [parameters] = useParameters();
  const apiKey = useAtomValue(apiKeyAtom);

  const initializeDataset = useCallback(() => {
    if (!pairings) {
      throw new Error("Pairs not loaded");
    }
    if (trainer.type !== "uninitialized") {
      throw new Error("Trainer already initialized");
    }
    let { train, test } = trainTestSplit(
      pairings,
      parameters.testSplitFraction
    );
    if (parameters.generateSyntheticNegatives) {
      // We do not store these long-term because of the risk of leakage between train and test
      train = augmentNegatives(train);
      test = augmentNegatives(test);
    }
    if (currentDataset.type === "local") {
      trainer.initializeLocal({
        trainSet: train,
        testSet: test,
        parameters,
        apiKey: apiKey || "",
      });
    } else if (currentDataset.type === "example") {
      trainer.initializeExample({
        trainSet: train,
        testSet: test,
        parameters,
        cacheUrl: currentDataset.embeddingsURL,
      });
    }
  }, [parameters, pairings, currentDataset, apiKey, trainer]);
  const datasetCounts = pairings ? countLabels(pairings) : null;
  return { initializeDataset, datasetCounts };
}
