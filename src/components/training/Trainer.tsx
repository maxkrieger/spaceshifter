import useParameters from "@/hooks/useParameters";

import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { cardStyles } from "@/lib/const";
import ParametersSetup from "./ParametersSetup";
import useTrainer from "@/hooks/trainer/useTrainer";
import { Accuracy } from "./Accuracy";
import { RenderGraphics } from "./RenderGraphics";

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
        <>
          <ParametersSetup />
          <div className="flex flex-row my-2">
            <Button
              onClick={() => trainer.actions.train(parameters)}
              className="w-full"
            >
              Train
            </Button>
          </div>
        </>
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
            <Button variant={"destructive"} onClick={trainer.actions.reset}>
              Stop
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
