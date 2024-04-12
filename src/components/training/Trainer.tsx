import useParameters from "@/hooks/useParameters";

import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import Histogram from "../Histogram";
import LossCurve from "./LossCurve";
import { cardStyles } from "@/lib/const";
import ParametersSetup from "./ParametersSetup";
import useTrainer from "@/hooks/trainer/useTrainer";
import { TrainerAPI } from "@/hooks/trainer/trainerState";

function Accuracy({ state }: { state: TrainerAPI }) {
  if (state.type !== "doneTraining" && state.type !== "training") {
    return null;
  }
  const trainPerfDiff =
    Math.round(
      10000 *
        (state.currentPerformance.trainAccuracyAndSE.accuracy -
          state.pretrainingPerformance.trainAccuracyAndSE.accuracy)
    ) / 100;
  const testPerfDiff =
    Math.round(
      10000 *
        (state.currentPerformance.testAccuracyAndSE.accuracy -
          state.pretrainingPerformance.testAccuracyAndSE.accuracy)
    ) / 100;
  return (
    <p className="text-slate-300 my-4">
      Currently, test accuracy is{" "}
      <span className="text-white">
        {state.currentPerformance.testAccuracyAndSE.message}
      </span>{" "}
      (
      <span className={testPerfDiff > 0 ? "text-green-300" : "text-red-300"}>
        {testPerfDiff > 0 ? "+" : ""}
        {testPerfDiff}%
      </span>
      ) and train accuracy is{" "}
      <span className="text-white">
        {state.currentPerformance.trainAccuracyAndSE.message}
      </span>{" "}
      (
      <span className={trainPerfDiff > 0 ? "text-green-300" : "text-red-300"}>
        {trainPerfDiff > 0 ? "+" : ""}
        {trainPerfDiff}%
      </span>
      ).
    </p>
  );
}

function RenderGraphics({ state }: { state: TrainerAPI }) {
  if (state.type !== "doneTraining" && state.type !== "training") {
    return null;
  }
  return (
    <div className="flex flex-row items-center justify-center flex-wrap">
      <LossCurve performanceHistory={state.performanceHistory} />
      <Histogram
        testPairings={state.currentPerformance.testCosinePairings}
        trainPairings={state.currentPerformance.trainCosinePairings}
      />
    </div>
  );
}

export default function Trainer() {
  const [parameters] = useParameters();
  const trainer = useTrainer();

  if (
    trainer.type === "uninitialized" ||
    trainer.type === "embeddingProgress" ||
    trainer.type === "fetchingEmbeddings"
  ) {
    return (
      <div className={cardStyles + " opacity-50"}>
        <h1 className="text-2xl">Training</h1>
      </div>
    );
  }

  return (
    <div className={cardStyles}>
      <h1 className="text-2xl mb-3">Training</h1>
      {(trainer.type === "doneTraining" || trainer.type === "pretrained") && (
        <ParametersSetup>
          <div className="flex flex-row p-3">
            <Button
              onClick={() => trainer.train(parameters)}
              className="w-full"
            >
              Train
            </Button>
          </div>
        </ParametersSetup>
      )}
      <div>
        {(trainer.type === "training" ||
          trainer.type === "trainingStarted") && (
          <div>
            <p className="text-slate-300 my-2">
              Training (epoch {trainer.currentEpoch + 1}/{parameters.epochs})
            </p>
            <Progress
              className="h-[20px]"
              value={Math.round(
                (trainer.currentEpoch / parameters.epochs) * 100
              )}
            />
          </div>
        )}
        <Accuracy state={trainer} />
        <RenderGraphics state={trainer} />
        <div className="flex flex-row justify-end">
          {trainer.type === "training" ? (
            <Button variant={"destructive"} onClick={trainer.reset}>
              Stop
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
