import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useToast } from "./ui/use-toast";
import {
  bestMatrixAtom,
  currentDatasetAtom,
  projectPhaseAtom,
  trainingWorkerAtom,
} from "@/lib/atoms";
import {
  AccuracyAndSE,
  OptimizationParameters,
  OptimizerType,
  PerformanceGroup,
  PerformanceHistory,
  ProjectPhase,
} from "@/lib/types";
import useParameters from "@/lib/useParameters";
import { Label } from "./ui/label";
import TooltipWrapper from "./TooltipWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCallback, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import Histogram from "./Histogram";
import LossCurve from "./LossCurve";
import { db } from "@/lib/db";

export default function Trainer() {
  const { toast } = useToast();
  const [projectPhase, setProjectPhase] = useAtom(projectPhaseAtom);
  const currentDataset = useAtomValue(currentDatasetAtom);
  const [parameters, setParameters] = useParameters();
  const workerClient = useAtomValue(trainingWorkerAtom);
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [currentPerformance, setCurrentPerformance] =
    useState<PerformanceGroup | null>(null);
  const [performanceHistory, setPerformanceHistory] =
    useState<PerformanceHistory>([]);
  const setBestMatrix = useSetAtom(bestMatrixAtom);

  const changeOptimizer = useCallback(
    (value: OptimizerType) => {
      const params = { ...parameters };
      if (value === "adamax") {
        params.learningRate = 0.01;
        params.batchSize = 10;
      } else {
        params.learningRate = 10;
        params.batchSize = 10;
      }
      setParameters({ ...params, optimizer: value });
    },
    [setParameters, parameters]
  );
  const changeValue = useCallback(
    (value: number, key: keyof OptimizationParameters) => {
      setParameters({ ...parameters, [key]: value });
    },
    [parameters, setParameters]
  );
  const train = useCallback(() => {
    workerClient?.addListener((message) => {
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
        if (currentDataset?.type === "local") {
          (async () => {
            // TODO
            // await db.savedMatrices.add({
            //   matrix: message.matrixNpy,
            //   shape: message.shape,
            //   dataset: currentDataset.id,
            //   dateCreated: new Date(),
            // });
          })();
        }
      } else if (message.type === "error") {
        toast({
          title: "Error",
          description: message.message,
          variant: "destructive",
        });
        setCurrentEpoch(null);
      }
    });
    setProjectPhase(ProjectPhase.Embedded);
    setCurrentEpoch(0);
    setCurrentPerformance(null);
    setPerformanceHistory([]);
    workerClient?.sendMessage({ type: "train", parameters });
  }, [
    workerClient,
    toast,
    setProjectPhase,
    parameters,
    currentDataset,
    setBestMatrix,
  ]);
  const stop = useCallback(() => {
    workerClient?.terminate();
    setCurrentEpoch(null);
    setPerformanceHistory([]);
    setCurrentPerformance(null);
    setProjectPhase(ProjectPhase.DataPresent);
  }, [workerClient, setProjectPhase]);

  if (projectPhase < ProjectPhase.Embedded || !workerClient) {
    return (
      <div className="opacity-50 border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
        <h1 className="text-2xl">Training</h1>
      </div>
    );
  }
  return (
    <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
      <h1 className="text-2xl">Training</h1>
      {currentEpoch === null && (
        <div>
          <p className="text-slate-300">
            Hover on a parameter name to see more info.
          </p>
          <div className="p-3 flex flex-wrap gap-5">
            <div className="flex flex-row gap-4">
              <div className="flex gap-3">
                <TooltipWrapper tooltip="How big should the embedding be after the matmul. Results are usually better but more expensive to search over.">
                  <Label
                    htmlFor="targetEmbeddingSize"
                    className="flex-shrink-0"
                  >
                    Target Embedding Size
                  </Label>
                </TooltipWrapper>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={parameters.targetEmbeddingSize}
                  onChange={(e) =>
                    changeValue(Number(e.target.value), "targetEmbeddingSize")
                  }
                  id="targetEmbeddingSize"
                />
              </div>
              <TooltipWrapper tooltip="The algorithm to optimize the matrix. Simple Gradient Descent usually works best.">
                <Label htmlFor="optimizer">Optimizer</Label>
              </TooltipWrapper>
              <Select
                value={parameters.optimizer}
                onValueChange={changeOptimizer}
              >
                <SelectTrigger className="w-[250px]" id="optimizer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient">
                    Simple Gradient Descent
                  </SelectItem>
                  <SelectItem value="adamax">Adamax</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <TooltipWrapper tooltip="How big of a gradient to apply at each step?">
                <Label htmlFor="learningRate" className="flex-shrink-0">
                  Learning Rate
                </Label>
              </TooltipWrapper>
              <Input
                type="number"
                min={0.000001}
                value={parameters.learningRate}
                onChange={(e) =>
                  changeValue(Number(e.target.value), "learningRate")
                }
                id="learningRate"
              />
            </div>
            <div className="flex gap-3">
              <TooltipWrapper tooltip="How many examples to show on each step?">
                <Label htmlFor="batchSize" className="flex-shrink-0">
                  Batch Size
                </Label>
              </TooltipWrapper>
              <Input
                type="number"
                min={1}
                step={10}
                value={parameters.batchSize}
                onChange={(e) =>
                  changeValue(Number(e.target.value), "batchSize")
                }
                id="batchSize"
              />
            </div>
            <div className="flex gap-3">
              <TooltipWrapper tooltip="How many times should all examples be shown?">
                <Label htmlFor="epochs" className="flex-shrink-0">
                  Epochs
                </Label>
              </TooltipWrapper>
              <Input
                type="number"
                min={1}
                step={10}
                value={parameters.epochs}
                onChange={(e) => changeValue(Number(e.target.value), "epochs")}
                id="epochs"
              />
            </div>
            <div className="flex gap-3">
              <TooltipWrapper tooltip="To prevent overfitting.">
                <Label htmlFor="dropoutFraction" className="flex-shrink-0">
                  Dropout Fraction
                </Label>
              </TooltipWrapper>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={parameters.dropoutFraction}
                onChange={(e) =>
                  changeValue(Number(e.target.value), "dropoutFraction")
                }
                id="dropoutFraction"
              />
            </div>
            <Button className="w-full" onClick={train}>
              Train
            </Button>
          </div>
        </div>
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
          <div className="flex flex-row justify-around items-center my-4 flex-wrap">
            <p className="text-slate-300 max-w-[300px]">
              Currently, test accuracy is{" "}
              <span className="text-white">
                {currentPerformance.testAccuracyAndSE.message}
              </span>{" "}
              and train accuracy is{" "}
              <span className="text-white">
                {currentPerformance.trainAccuracyAndSE.message}
              </span>
              .
            </p>
            {performanceHistory.length > 0 && (
              <LossCurve performanceHistory={performanceHistory} />
            )}
          </div>
        )}
        <div className="flex flex-col items-center">
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
