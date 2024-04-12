import PretrainingSetup from "./PretrainingSetup";
import Histogram from "../Histogram";
import { Button } from "../ui/button";
import { Download, Loader2Icon } from "lucide-react";
import { cardStyles } from "@/lib/const";
import TooltipWrapper from "../util/TooltipWrapper";
import useTrainer from "@/hooks/trainer/useTrainer";
import usePairings from "@/hooks/usePairings";
import { Progress } from "../ui/progress";

export default function Pretraining() {
  const trainer = useTrainer();
  const pairs = usePairings();
  if (pairs.length === 0) {
    return (
      <div className={cardStyles + " opacity-50"}>
        <h1 className="text-2xl">Embeddings</h1>
      </div>
    );
  }
  if (trainer.type === "uninitialized") {
    return <PretrainingSetup />;
  }
  if (trainer.type === "fetchingEmbeddings") {
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
  if (trainer.type === "embeddingProgress") {
    return (
      <div className={cardStyles}>
        <h1 className="text-2xl">Pretraining</h1>
        <div className="p-2">
          <p className="py-2 text-slate-300">
            embedding & caching ({Math.round(trainer.progress * 100)}
            %)...
          </p>
          <Progress value={trainer.progress * 100} />
        </div>
      </div>
    );
  }

  return (
    <div className={cardStyles}>
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl mb-3">Pretraining</h1>
        <TooltipWrapper tooltip="Download all embeddings" asChild>
          <Button
            variant={"ghost"}
            onClick={trainer.downloadEmbeddings}
            aria-label="Download all embeddings"
          >
            <Download size={14} />
          </Button>
        </TooltipWrapper>
      </div>
      <div>
        <div className="py-3">
          <p className="text-slate-300 text-l">
            The test set has{" "}
            <span className="text-white">
              {trainer.pretrainingPerformance.testCosinePairings.length}
            </span>{" "}
            pairs and the train set has{" "}
            <span className="text-white">
              {trainer.pretrainingPerformance.trainCosinePairings.length}
            </span>{" "}
            pairs.
          </p>
          <p className="text-slate-300 text-l">
            Before training, the test set performance is{" "}
            <span className="text-white">
              {trainer.pretrainingPerformance.testAccuracyAndSE.message}
            </span>{" "}
            and the train set performance is{" "}
            <span className="text-white">
              {trainer.pretrainingPerformance.trainAccuracyAndSE.message}
            </span>
            .
          </p>
          <p className="text-slate-300 text-l">
            Ideally, a red peak will be on the left and a blue peak will be on
            the right, non-overlapping.
          </p>
        </div>
        <div>
          <Histogram
            trainPairings={trainer.pretrainingPerformance.trainCosinePairings}
            testPairings={trainer.pretrainingPerformance.testCosinePairings}
          />
        </div>
      </div>
    </div>
  );
}
