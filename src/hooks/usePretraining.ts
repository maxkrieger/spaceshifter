import {
  apiKeyAtom,
  currentDatasetAtom,
  pretrainingPerformanceAtom,
  projectPhaseAtom,
  trainingWorkerAtom,
} from "@/lib/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import useParameters from "./useParameters";
import { ProjectPhase } from "@/types";
import trainTestSplit from "@/lib/trainTestSplit";
import augmentNegatives from "@/lib/augmentNegatives";
import TrainingWorkerClient from "@/lib/TrainingWorkerClient";
import { countLabels } from "@/lib/utils";
import usePairings from "./usePairings";

type PretrainingStatus =
  | { type: "embeddingProgress"; progress: number }
  | { type: "fetching" }
  | { type: "idle" };

/**
 * Takes a flat dataset of pairings, augments it, and sends it to a new worker
 * Provides status and dataset info
 */
export default function usePretraining(): {
  initializeDataset: () => void;
  status: PretrainingStatus;
  datasetCounts: {
    positives: number;
    negatives: number;
  } | null;
} {
  const setWorkerClient = useSetAtom(trainingWorkerAtom);

  const currentDataset = useAtomValue(currentDatasetAtom);
  const pairings = usePairings();

  const [pretrainingStatus, setPretrainingStatus] = useState<PretrainingStatus>(
    {
      type: "idle",
    }
  );
  const [parameters] = useParameters();
  const setPerformance = useSetAtom(pretrainingPerformanceAtom);
  const setProjectPhase = useSetAtom(projectPhaseAtom);

  const initializeWorkerClient = useCallback(() => {
    const workerClient = new TrainingWorkerClient();
    setWorkerClient(workerClient);
    workerClient.addListener((message) => {
      if (message.type === "embeddingProgress") {
        setPretrainingStatus({
          type: "embeddingProgress",
          progress: message.progress,
        });
      } else if (message.type === "initialPerformance") {
        setPerformance(message.performance);
        setPretrainingStatus({ type: "idle" });
        setProjectPhase(ProjectPhase.Embedded);
      } else if (message.type === "fetchingStatus") {
        setPretrainingStatus({
          type: "fetching",
        });
      }
    });
    return workerClient;
  }, [setWorkerClient, setPerformance, setProjectPhase]);

  const apiKey = useAtomValue(apiKeyAtom);
  const initializeDataset = useCallback(() => {
    if (!pairings) {
      throw new Error("Pairs not loaded");
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
    const worker = initializeWorkerClient();
    if (currentDataset.type === "local") {
      const model = parameters.embeddingModel;
      worker.sendMessage({
        type: "initializeLocalDataset",
        trainSet: train,
        testSet: test,
        parameters,
        apiKey: apiKey || "",
        model,
      });
      setPretrainingStatus({ type: "embeddingProgress", progress: 0 });
    } else if (currentDataset.type === "example") {
      worker.sendMessage({
        type: "initializeExampleDataset",
        trainSet: train,
        testSet: test,
        parameters,
        cacheUrl: currentDataset.embeddingsURL,
      });
    }
  }, [parameters, initializeWorkerClient, pairings, currentDataset, apiKey]);
  const datasetCounts = pairings ? countLabels(pairings) : null;
  return { initializeDataset, status: pretrainingStatus, datasetCounts };
}
