import {
  apiKeyAtom,
  currentDatasetAtom,
  exampleDatasetAtom,
  projectPhaseAtom,
  trainingWorkerAtom,
} from "@/lib/atoms";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import TrainingWorkerClient from "@/lib/TrainingWorkerClient";
import { PerformanceGroup, ProjectPhase } from "@/lib/types";
import { Progress } from "./ui/progress";
import useParameters from "@/lib/useParameters";

export default function PretrainingSetup({
  setPerformance,
}: {
  setPerformance: (performance: PerformanceGroup) => void;
}) {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const setWorkerClient = useSetAtom(trainingWorkerAtom);
  const setPhase = useSetAtom(projectPhaseAtom);
  const apiKey = useAtomValue(apiKeyAtom);
  const [parameters, setParameters] = useParameters();
  const exampleDataset = useAtomValue(exampleDatasetAtom);
  const pairs = useLiveQuery(async () => {
    if (currentDataset?.type === "local") {
      const pairs = await db.pair
        .where("dataset")
        .equals(currentDataset.id)
        .toArray();
      return pairs;
    } else {
      return exampleDataset;
    }
  }, [currentDataset, exampleDataset]);
  const setTrainingParam = useCallback(
    (key: string, value: boolean | number) => {
      setParameters({ ...parameters, [key]: value });
    },
    [parameters, setParameters]
  );
  const [embeddingProgress, setEmbeddingProgress] = useState<number | null>(
    null
  );
  const embedAndSplit = useCallback(() => {
    if (pairs) {
      const workerClient = new TrainingWorkerClient();
      setWorkerClient(workerClient);
      workerClient.addListener((message) => {
        if (message.type === "embeddingProgress") {
          setEmbeddingProgress(message.progress);
        } else if (message.type === "initialPerformance") {
          setPerformance(message.performance);
          setEmbeddingProgress(null);
          setPhase(ProjectPhase.Embedded);
        }
      });
      setEmbeddingProgress(0);
      if (currentDataset?.type === "local") {
        workerClient.sendMessage({ type: "setApiKey", apiKey: apiKey! });
        workerClient.sendMessage({
          type: "setPairings",
          allPairings: pairs,
          parameters,
        });
      } else {
        workerClient.sendMessage({
          type: "setPairings",
          allPairings: exampleDataset,
          parameters,
          cacheUrl: currentDataset?.embeddingsURL,
        });
      }
    }
  }, [
    parameters,
    setWorkerClient,
    apiKey,
    pairs,
    setPerformance,
    setPhase,
    currentDataset,
    exampleDataset,
  ]);

  if (embeddingProgress !== null) {
    return (
      <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
        <h1 className="text-2xl">Pretraining</h1>
        <div className="p-2">
          <p className="py-2 text-slate-300">
            embedding & caching ({Math.round(embeddingProgress * 100)}%)...
          </p>
          <Progress value={embeddingProgress * 100} />
        </div>
      </div>
    );
  }
  if (!pairs) {
    return <div>loading...</div>;
  }
  const positiveExamples = pairs.filter((pair) => pair.label === 1).length;
  return (
    <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
      <h1 className="text-2xl">Pretraining</h1>
      <p className="text-slate-300 text-l my-2">
        In this step, we prepare the data for training by embedding it and
        splitting it into a training and test set. Embeddings are retrieved from
        your browser cache first.
      </p>
      <p className="text-slate-300 text-l my-2">
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
          checked={parameters.generateSyntheticNegatives}
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
          value={parameters.testSplitFraction}
          onChange={(e) =>
            setTrainingParam("testSplitFraction", Number(e.target.value))
          }
        />
        <Label htmlFor="split">Fraction of dataset used for testing</Label>
      </div>
      <div>
        <Button className="w-full" onClick={embedAndSplit}>
          Prepare Data
        </Button>
      </div>
    </div>
  );
}
