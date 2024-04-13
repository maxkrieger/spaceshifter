import { useToast } from "@/components/ui/use-toast";
import TrainingWorkerClient from "@/worker/TrainingWorkerClient";
import { downloadEmbeddingCache } from "@/lib/utils";
import {
  ExampleDatasetInitializer,
  LocalDatasetInitializer,
  OptimizationParameters,
  MessageFromTrainer,
} from "@/types";
import { useAtom, useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  TrainerAPI,
  trainingStateAtom,
  trainingWorkerAtom,
} from "./trainerState";

function useOnWorkerMessage() {
  const { toast } = useToast();
  const setTrainingState = useSetAtom(trainingStateAtom);
  return useCallback(
    (message: MessageFromTrainer) => {
      if (message.type === "embeddingProgress") {
        setTrainingState({
          type: "embeddingProgress",
          progress: message.progress,
        });
      } else if (message.type === "initialPerformance") {
        setTrainingState({
          type: "pretrained",
          pretrainingPerformance: message.performance,
        });
      } else if (message.type === "fetchingStatus") {
        setTrainingState({
          type: "fetchingEmbeddings",
        });
      } else if (message.type === "error") {
        toast({
          title: "Error",
          description: message.message,
          variant: "destructive",
        });
      } else if (message.type === "dumpEmbeddingCache") {
        downloadEmbeddingCache(message.cache);
      } else if (message.type === "doneTraining") {
        setTrainingState((prev) => {
          if (prev.type === "training") {
            return {
              type: "doneTraining",
              performanceHistory: prev.performanceHistory,
              currentPerformance: prev.currentPerformance,
              pretrainingPerformance: prev.pretrainingPerformance,
              bestMatrix: {
                matrixNpy: message.matrixNpy,
                shape: message.shape,
              },
            };
          }
          return prev;
        });
      } else if (message.type === "updatedPerformance") {
        setTrainingState((prev) => {
          if (prev.type === "training") {
            return {
              type: "training",
              currentEpoch: message.epoch,
              performanceHistory: [
                ...prev.performanceHistory,
                {
                  test: message.performance.testAccuracyAndSE,
                  train: message.performance.trainAccuracyAndSE,
                },
              ],
              currentPerformance: message.performance,
              pretrainingPerformance: prev.pretrainingPerformance,
            };
          } else if (prev.type === "trainingStarted") {
            return {
              type: "training",
              currentEpoch: message.epoch,
              performanceHistory: [
                {
                  test: prev.pretrainingPerformance.testAccuracyAndSE,
                  train: prev.pretrainingPerformance.trainAccuracyAndSE,
                },
                {
                  test: message.performance.testAccuracyAndSE,
                  train: message.performance.trainAccuracyAndSE,
                },
              ],
              currentPerformance: message.performance,
              pretrainingPerformance: prev.pretrainingPerformance,
            };
          }
          return prev;
        });
      }
    },
    [setTrainingState, toast]
  );
}

export default function useTrainer(): TrainerAPI {
  const [trainingWorker, setTrainingWorker] = useAtom(trainingWorkerAtom);
  const [trainingState, setTrainingState] = useAtom(trainingStateAtom);
  const onWorkerMessage = useOnWorkerMessage();

  const initializeWorkerClient = useCallback(() => {
    if (trainingWorker) {
      trainingWorker.terminate();
    }
    const workerClient = new TrainingWorkerClient();
    setTrainingWorker(workerClient);

    workerClient.addListener(onWorkerMessage);
    return workerClient;
  }, [onWorkerMessage, setTrainingWorker, trainingWorker]);

  const onInitializeLocal = useCallback(
    (initializer: LocalDatasetInitializer) => {
      const worker = initializeWorkerClient();
      worker.sendMessage({ type: "initializeLocalDataset", ...initializer });
    },
    [initializeWorkerClient]
  );
  const onInitializeExample = useCallback(
    (initializer: ExampleDatasetInitializer) => {
      const worker = initializeWorkerClient();
      worker.sendMessage({ type: "initializeExampleDataset", ...initializer });
    },
    [initializeWorkerClient]
  );

  const onTrain = useCallback(
    (parameters: OptimizationParameters) => {
      if (!trainingWorker) {
        throw new Error("Worker not initialized");
      }
      trainingWorker.sendMessage({ type: "train", parameters });
      setTrainingState((prev) => {
        if (prev.type === "pretrained" || prev.type === "doneTraining") {
          return {
            type: "trainingStarted",
            currentEpoch: 0,
            pretrainingPerformance: prev.pretrainingPerformance,
          };
        }
        return prev;
      });
    },
    [trainingWorker, setTrainingState]
  );

  const onDownloadEmbeddings = useCallback(() => {
    if (!trainingWorker) {
      throw new Error("Worker not initialized");
    }
    trainingWorker.sendMessage({ type: "getEmbeddingCache" });
  }, [trainingWorker]);

  const onReset = useCallback(() => {
    if (trainingWorker) {
      trainingWorker.terminate();
    }
    setTrainingState({ type: "uninitialized" });
  }, [trainingWorker, setTrainingState]);

  if (trainingState.type === "uninitialized") {
    return {
      ...trainingState,
      actions: {
        initializeLocal: onInitializeLocal,
        initializeExample: onInitializeExample,
      },
    };
  }
  if (
    trainingState.type === "fetchingEmbeddings" ||
    trainingState.type === "embeddingProgress"
  ) {
    return { ...trainingState, actions: { reset: onReset } };
  }

  if (trainingState.type === "pretrained") {
    return {
      ...trainingState,
      actions: {
        train: onTrain,
        downloadEmbeddings: onDownloadEmbeddings,
        reset: onReset,
      },
    };
  }

  if (
    trainingState.type === "trainingStarted" ||
    trainingState.type === "training"
  ) {
    return {
      ...trainingState,
      actions: {
        downloadEmbeddings: onDownloadEmbeddings,
        reset: onReset,
      },
    };
  }

  // Done training state
  return {
    ...trainingState,
    actions: {
      downloadEmbeddings: onDownloadEmbeddings,
      train: onTrain,
      reset: onReset,
    },
  };
}
