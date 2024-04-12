import { ProjectPhase } from "@/types";
import PretrainingSetup from "./PretrainingSetup";
import { useAtomValue } from "jotai";
import { pretrainingPerformanceAtom, projectPhaseAtom } from "@/lib/atoms";
import Histogram from "../Histogram";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { cardStyles } from "@/lib/const";
import TooltipWrapper from "../util/TooltipWrapper";
import useDownloadEmbeddings from "@/hooks/useDownloadEmbeddings";

export default function Pretraining() {
  const currentPhase = useAtomValue(projectPhaseAtom);
  const initialPerformance = useAtomValue(pretrainingPerformanceAtom);
  const downloadEmbeddings = useDownloadEmbeddings();
  if (currentPhase < ProjectPhase.DataPresent) {
    return (
      <div className={cardStyles + " opacity-50"}>
        <h1 className="text-2xl">Embeddings</h1>
      </div>
    );
  }
  if (currentPhase < ProjectPhase.Embedded) {
    return <PretrainingSetup />;
  }
  if (!initialPerformance) {
    return <div>loading...</div>;
  }

  return (
    <div className={cardStyles}>
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl mb-3">Pretraining</h1>
        <TooltipWrapper tooltip="Download all embeddings" asChild>
          <Button
            variant={"ghost"}
            onClick={downloadEmbeddings}
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
              {initialPerformance.testCosinePairings.length}
            </span>{" "}
            pairs and the train set has{" "}
            <span className="text-white">
              {initialPerformance.trainCosinePairings.length}
            </span>{" "}
            pairs.
          </p>
          <p className="text-slate-300 text-l">
            Before training, the test set performance is{" "}
            <span className="text-white">
              {initialPerformance.testAccuracyAndSE.message}
            </span>{" "}
            and the train set performance is{" "}
            <span className="text-white">
              {initialPerformance.trainAccuracyAndSE.message}
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
            trainPairings={initialPerformance.trainCosinePairings}
            testPairings={initialPerformance.testCosinePairings}
          />
        </div>
      </div>
    </div>
  );
}
