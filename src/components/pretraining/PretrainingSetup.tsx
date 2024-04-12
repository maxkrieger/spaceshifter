import { currentDatasetAtom, modelsAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
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
import usePretraining from "@/hooks/usePretraining";

export default function PretrainingSetup() {
  const { initializeDataset, status, datasetCounts } = usePretraining();
  const [parameters, setParameter] = useParameters();
  const currentDataset = useAtomValue(currentDatasetAtom);
  const embeddingModels = useAtomValue(modelsAtom);

  if (status.type === "fetching") {
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
  if (status.type === "embeddingProgress") {
    return (
      <div className={cardStyles}>
        <h1 className="text-2xl">Pretraining</h1>
        <div className="p-2">
          <p className="py-2 text-slate-300">
            embedding & caching ({Math.round(status.progress * 100)}
            %)...
          </p>
          <Progress value={status.progress * 100} />
        </div>
      </div>
    );
  }
  if (!datasetCounts) {
    return <div>loading...</div>;
  }
  const enoughData = datasetCounts.positives + datasetCounts.negatives > 1;
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
        There are <span className="text-white">{datasetCounts.positives}</span>{" "}
        positive examples and{" "}
        <span className="text-white">{datasetCounts.negatives}</span> negative
        examples.{" "}
        {!enoughData && (
          <span className="text-red-300 font-bold">
            You need at least 2 examples to train.
          </span>
        )}
        {enoughData && datasetCounts.negatives < datasetCounts.positives
          ? "More negative examples can be generated."
          : ""}
      </p>
      <div className="grid grid-cols-[250px,1fr] gap-3 p-3 items-center">
        {datasetCounts.positives - datasetCounts.negatives > 0 && (
          <>
            <Label htmlFor="augment" className="md:text-right sm:text-left">
              Generate{" "}
              {Math.max(datasetCounts.positives - datasetCounts.negatives, 0)}{" "}
              negative examples
            </Label>
            <Switch
              id="augment"
              checked={parameters.generateSyntheticNegatives}
              onCheckedChange={(b) =>
                setParameter("generateSyntheticNegatives", b)
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
            setParameter("testSplitFraction", Number(e.target.value))
          }
        />
        {currentDataset.type === "local" &&
          embeddingModels.state === "hasData" && (
            <>
              <Label htmlFor="model" className="md:text-right sm:text-left">
                Embedding model
              </Label>
              <Select
                value={parameters.embeddingModel}
                onValueChange={(v) => setParameter("embeddingModel", v)}
              >
                <SelectTrigger className="md:w-[250px] sm:w-[200px]" id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {embeddingModels.data.map((model, i) => (
                    <SelectItem key={i} value={model}>
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
          onClick={initializeDataset}
          disabled={!enoughData}
        >
          {!enoughData ? "Not enough examples" : "Prepare Data"}
        </Button>
      </div>
    </div>
  );
}
