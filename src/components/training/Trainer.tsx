import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useToast } from "../ui/use-toast";
import {
  bestMatrixAtom,
  pretrainingPerformanceAtom,
  projectPhaseAtom,
  trainingWorkerAtom,
} from "@/lib/atoms";
import { PerformanceGroup, PerformanceHistory, ProjectPhase } from "@/types";
import useParameters from "@/hooks/useParameters";

import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import Histogram from "../Histogram";
import LossCurve from "../LossCurve";
import { cardStyles } from "@/lib/const";
import ParametersSetup from "./ParametersSetup";

export default function Trainer() {
  const { toast } = useToast();
  const [projectPhase, setProjectPhase] = useAtom(projectPhaseAtom);
  const workerClient = useAtomValue(trainingWorkerAtom);
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [currentPerformance, setCurrentPerformance] =
    useState<PerformanceGroup | null>(null);
  const [performanceHistory, setPerformanceHistory] =
    useState<PerformanceHistory>([]);
  const pretrainingPerformance = useAtomValue(pretrainingPerformanceAtom);
  const setBestMatrix = useSetAtom(bestMatrixAtom);
  const [parameters] = useParameters();

  const train = useCallback(async () => {
    if (!workerClient) {
      return;
    }
    const cancel = workerClient.addListener((message) => {
      if (message.type === "updatedPerformance") {
        setCurrentEpoch(message.epoch);
        setCurrentPerformance(message.performance);
        setPerformanceHistory((history) => [
          ...history,
          {
            test: message.performance.testAccuracyAndSE,
            train: message.performance.trainAccuracyAndSE,
          },
        ]);
      } else if (message.type === "doneTraining") {
        setProjectPhase(ProjectPhase.Trained);
        setCurrentEpoch(null);
        setBestMatrix({ matrixNpy: message.matrixNpy, shape: message.shape });
        cancel();
      } else if (message.type === "error") {
        toast({
          title: "Error",
          description: message.message,
          variant: "destructive",
        });
        setCurrentEpoch(null);
        cancel();
      }
    });
    setProjectPhase(ProjectPhase.Embedded);
    setCurrentEpoch(0);
    setCurrentPerformance(null);
    setPerformanceHistory([]);
    workerClient?.sendMessage({ type: "train", parameters });
  }, [workerClient, toast, setProjectPhase, parameters, setBestMatrix]);
  const stop = useCallback(() => {
    workerClient?.terminate();
    setCurrentEpoch(null);
    setPerformanceHistory([]);
    setCurrentPerformance(null);
    setProjectPhase(ProjectPhase.DataPresent);
  }, [workerClient, setProjectPhase]);

  if (projectPhase < ProjectPhase.Embedded || !workerClient) {
    return (
      <div className={cardStyles + " opacity-50"}>
        <h1 className="text-2xl">Training</h1>
      </div>
    );
  }
  const trainPerfDiff =
    Math.round(
      10000 *
        ((currentPerformance?.trainAccuracyAndSE.accuracy ?? 0) -
          (pretrainingPerformance?.trainAccuracyAndSE?.accuracy ?? 0))
    ) / 100;
  const testPerfDiff =
    Math.round(
      10000 *
        ((currentPerformance?.testAccuracyAndSE.accuracy ?? 0) -
          (pretrainingPerformance?.testAccuracyAndSE?.accuracy ?? 0))
    ) / 100;
  return (
    <div className={cardStyles}>
      <h1 className="text-2xl mb-3">Training</h1>
      {currentEpoch === null && (
        <ParametersSetup>
          <div className="flex flex-row px-3">
            <Button onClick={train} className="w-full">
              Train
            </Button>
          </div>
        </ParametersSetup>
      )}
      <div>
        {currentEpoch !== null && (
          <div>
            <p className="text-slate-300 my-2">
              Training (epoch {currentEpoch + 1}/{parameters.epochs})
            </p>
            <Progress
              className="h-[20px]"
              value={Math.round((currentEpoch / parameters.epochs) * 100)}
            />
          </div>
        )}
        {currentPerformance && (
          <p className="text-slate-300 my-4">
            Currently, test accuracy is{" "}
            <span className="text-white">
              {currentPerformance.testAccuracyAndSE.message}
            </span>{" "}
            (
            <span
              className={testPerfDiff > 0 ? "text-green-300" : "text-red-300"}
            >
              {testPerfDiff > 0 ? "+" : ""}
              {testPerfDiff}%
            </span>
            ) and train accuracy is{" "}
            <span className="text-white">
              {currentPerformance.trainAccuracyAndSE.message}
            </span>{" "}
            (
            <span
              className={trainPerfDiff > 0 ? "text-green-300" : "text-red-300"}
            >
              {trainPerfDiff > 0 ? "+" : ""}
              {trainPerfDiff}%
            </span>
            ).
          </p>
        )}
        <div className="flex flex-row items-center justify-center flex-wrap">
          {performanceHistory.length > 0 && (
            <LossCurve performanceHistory={performanceHistory} />
          )}
          {currentPerformance && (
            <Histogram
              testPairings={currentPerformance.testCosinePairings}
              trainPairings={currentPerformance.trainCosinePairings}
            />
          )}
        </div>
        <div className="flex flex-row justify-end">
          {currentEpoch ? (
            <Button variant={"destructive"} onClick={stop}>
              Stop
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
