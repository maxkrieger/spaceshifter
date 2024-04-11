import {
  apiKeyAtom,
  currentDatasetAtom,
  modelsAtom,
  projectPhaseAtom,
  trainingWorkerAtom,
} from "@/lib/atoms";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import TrainingWorkerClient from "@/lib/TrainingWorkerClient";
import {
  PerformanceGroup,
  ProjectPhase,
  OptimizationParameters,
  Pairings,
} from "@/types";
import { Progress } from "../ui/progress";
import useParameters from "@/hooks/useParameters";
import { cardStyles as cardStyles } from "@/lib/const";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2Icon } from "lucide-react";
import { countLabels } from "@/lib/utils";

type EmbeddingStatus =
  | { type: "embeddingProgress"; progress: number }
  | { type: "fetching" }
  | { type: "idle" };

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
  const pairs = useLiveQuery(async () => {
    if (currentDataset.type === "local") {
      const pairs = await db.pair
        .where("dataset")
        .equals(currentDataset.id)
        .toArray();
      return pairs as Pairings;
    } else if (currentDataset.type === "example") {
      return currentDataset.pairings;
    }
  }, [currentDataset]);
  const setTrainingParam = useCallback(
    (key: keyof OptimizationParameters, value: boolean | number) => {
      setParameters({ ...parameters, [key]: value });
    },
    [parameters, setParameters]
  );
  const [embeddingStatus, setEmbeddingStatus] = useState<EmbeddingStatus>({
    type: "idle",
  });
  const embeddingModels = useAtomValue(modelsAtom);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState(0);
  const embedAndSplit = useCallback(() => {
    if (pairs) {
      const workerClient = new TrainingWorkerClient();
      setWorkerClient(workerClient);
      workerClient.addListener((message) => {
        if (message.type === "embeddingProgress") {
          setEmbeddingStatus({
            type: "embeddingProgress",
            progress: message.progress,
          });
        } else if (message.type === "initialPerformance") {
          setPerformance(message.performance);
          setEmbeddingStatus({ type: "idle" });
          setPhase(ProjectPhase.Embedded);
        } else if (message.type === "fetchingStatus") {
          setEmbeddingStatus({
            type: "fetching",
          });
        }
      });
      if (currentDataset.type === "local") {
        const model =
          embeddingModels.state === "hasData"
            ? embeddingModels.data[selectedEmbeddingModel]
            : undefined;
        workerClient.sendMessage({
          type: "initializeLocalDataset",
          allPairings: pairs,
          parameters,
          apiKey: apiKey!,
          model,
        });
        setEmbeddingStatus({ type: "embeddingProgress", progress: 0 });
      } else if (currentDataset.type === "example") {
        workerClient.sendMessage({
          type: "initializeExampleDataset",
          allPairings: currentDataset.pairings,
          parameters,
          cacheUrl: currentDataset.embeddingsURL,
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
    embeddingModels,
    selectedEmbeddingModel,
  ]);

  if (embeddingStatus.type === "fetching") {
    return (
      <div className={cardStyles}>
        <h1 className="text-2xl">Pretraining</h1>
        <div className="p-2 w-full flex flex-col justify-center items-center">
          <p className="py-2 text-slate-300">
            Fetching precomputed embeddings...
          </p>
          <Loader2Icon className="animate-spin" />
        </div>
      </div>
    );
  }
  if (embeddingStatus.type === "embeddingProgress") {
    return (
      <div className={cardStyles}>
        <h1 className="text-2xl">Pretraining</h1>
        <div className="p-2">
          <p className="py-2 text-slate-300">
            embedding & caching ({Math.round(embeddingStatus.progress * 100)}
            %)...
          </p>
          <Progress value={embeddingStatus.progress * 100} />
        </div>
      </div>
    );
  }
  if (!pairs) {
    return <div>loading...</div>;
  }
  const { positives, negatives } = countLabels(pairs);
  return (
    <div className={cardStyles}>
      <h1 className="text-2xl">Pretraining</h1>
      <p className="text-slate-300 text-l my-2">
        In this step, we prepare the data for training by embedding it and
        splitting it into a training and test set. Embeddings are retrieved from
        your browser cache first. If they aren't cached,{" "}
        <span className="text-white font-bold">
          this may download 50mb+ of data
        </span>
        .
      </p>
      <p className="text-slate-300 text-l my-2">
        There are <span className="text-white">{positives}</span> positive
        examples and <span className="text-white">{negatives}</span> negative
        examples.{" "}
        {pairs.length <= 1 && (
          <span className="text-red-300 font-bold">
            You need at least 2 examples to train.
          </span>
        )}
        {pairs.length > 1 && negatives < positives
          ? "More negative examples can be generated."
          : ""}
      </p>
      <div className="grid grid-cols-[250px,1fr] gap-3 p-3 items-center">
        {positives - negatives > 0 && (
          <>
            <Label htmlFor="augment" className="md:text-right sm:text-left">
              Generate {Math.max(positives - negatives, 0)} negative examples
            </Label>
            <Switch
              id="augment"
              checked={parameters.generateSyntheticNegatives}
              onCheckedChange={(b) =>
                setTrainingParam("generateSyntheticNegatives", b)
              }
            />
          </>
        )}
        <Label htmlFor="split" className="md:text-right sm:text-left">
          Fraction of dataset used for testing
        </Label>
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
        {currentDataset.type === "local" && (
          <>
            <Label htmlFor="model" className="md:text-right sm:text-left">
              Embedding model
            </Label>
            <Select
              value={selectedEmbeddingModel.toString()}
              onValueChange={(v) => setSelectedEmbeddingModel(parseInt(v, 10))}
            >
              <SelectTrigger className="md:w-[250px] sm:w-[200px]" id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {embeddingModels.state === "hasData" &&
                  embeddingModels.data.map((model, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {model}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      <div className="w-full px-3">
        <Button
          className="w-full"
          onClick={embedAndSplit}
          disabled={pairs.length <= 1}
        >
          {pairs.length <= 1 ? "Not enough examples" : "Prepare Data"}
        </Button>
      </div>
    </div>
  );
}
