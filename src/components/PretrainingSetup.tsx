import {
  apiKeyAtom,
  currentDatasetAtom,
  projectPhaseAtom,
  trainingWorkerAtom,
} from "@/lib/atoms";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import useDataset from "@/lib/useDataset";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import TrainingWorkerClient from "@/lib/TrainingWorkerClient";
import trainTestSplit from "@/lib/trainTestSplit";
import augmentNegatives from "@/lib/augmentNegatives";
import { PerformanceGroup, ProjectPhase } from "@/lib/types";
import { Progress } from "./ui/progress";

export default function PretrainingSetup({
  setPerformance,
}: {
  setPerformance: (performance: {
    perf: PerformanceGroup;
    testSize: number;
    trainSize: number;
  }) => void;
}) {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const setWorkerClient = useSetAtom(trainingWorkerAtom);
  const setPhase = useSetAtom(projectPhaseAtom);
  const apiKey = useAtomValue(apiKeyAtom);
  const datasetValue = useDataset();
  const pairs = useLiveQuery(async () => {
    if (currentDataset?.type === "local") {
      const pairs = await db.pair
        .where("dataset")
        .equals(currentDataset.id)
        .toArray();
      return pairs;
    }
    return null;
  }, [currentDataset]);
  const setTrainingParam = useCallback(
    (key: string, value: boolean | number) => {
      if (currentDataset?.type === "local") {
        (async () => {
          await db.dataset.update(currentDataset.id, {
            [`trainingParams.${key}`]: value,
          });
        })();
      }
    },
    [currentDataset]
  );
  const [embeddingProgress, setEmbeddingProgress] = useState<number | null>(
    null
  );
  const embedAndSplit = useCallback(() => {
    if (datasetValue && pairs) {
      const workerClient = new TrainingWorkerClient(apiKey!);
      setWorkerClient(workerClient);
      const { train, test } = trainTestSplit(
        pairs,
        datasetValue.trainingParams.testSplitFraction
      );
      const shouldAugment =
        datasetValue.trainingParams.generateSyntheticNegatives;
      const testAugmented = shouldAugment ? augmentNegatives(test, 1) : test;
      const trainingAugmented = shouldAugment
        ? augmentNegatives(train, 1)
        : train;
      workerClient.addListener((message) => {
        if (message.type === "embeddingProgress") {
          setEmbeddingProgress(message.progress);
        } else if (message.type === "initialPerformance") {
          setPerformance({
            perf: message.performance,
            testSize: testAugmented.length,
            trainSize: trainingAugmented.length,
          });
          setPhase(ProjectPhase.Embedded);
        }
      });
      setEmbeddingProgress(0);
      workerClient.sendMessage({
        type: "setPairings",
        testOrig: test,
        trainingOrig: train,
        trainingAugmented,
        testAugmented,
      });
    }
  }, [datasetValue, setWorkerClient, apiKey, pairs, setPerformance, setPhase]);

  if (embeddingProgress !== null) {
    return (
      <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
        <h1 className="text-2xl">Pretraining</h1>
        <div className="p-2">
          <p className="py-2 text-slate-300">
            embedding & caching ({Math.round(embeddingProgress * 100)}%)...
          </p>
          <Progress value={embeddingProgress * 100} className="w-[60%]" />
        </div>
      </div>
    );
  }
  if (!pairs || !datasetValue) {
    return <div>loading...</div>;
  }
  const positiveExamples = pairs.filter((pair) => pair.label === 1).length;
  return (
    <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
      <h1 className="text-2xl">Pretraining</h1>
      <p className="text-slate-400 text-l my-2">
        In this step, we prepare the data for training by splitting it into a
        training and test set.
      </p>
      <p className="text-slate-400 text-l my-2">
        There <span className="text-white">{positiveExamples}</span> positive
        examples and{" "}
        <span className="text-white">{pairs.length - positiveExamples}</span>{" "}
        negative examples.{" "}
        {pairs.length - positiveExamples < positiveExamples &&
          "More negative examples can be generated."}
      </p>
      <div className="m-3 flex items-center space-x-2">
        <Switch
          id="augment"
          checked={datasetValue.trainingParams.generateSyntheticNegatives}
          onCheckedChange={(b) =>
            setTrainingParam("generateSyntheticNegatives", b)
          }
        />
        <Label htmlFor="augment">
          Generate enough negative examples to match positives
        </Label>
      </div>
      <div className="m-3 flex items-center space-x-2">
        <Input
          id="split"
          type="number"
          className="max-w-[100px]"
          max={0.9}
          min={0.1}
          step={0.1}
          value={datasetValue.trainingParams.testSplitFraction}
          onChange={(e) =>
            setTrainingParam("testSplitFraction", Number(e.target.value))
          }
        />
        <Label htmlFor="split">Fraction of dataset used for testing</Label>
      </div>
      <div>
        <Button className="w-full" onClick={embedAndSplit}>
          Embed and split!
        </Button>
      </div>
    </div>
  );
}
