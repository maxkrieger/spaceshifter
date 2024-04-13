import Histogram from "../Histogram";
import LossCurve from "./LossCurve";
import { TrainerAPI } from "@/hooks/trainer/trainerState";

export function RenderGraphics({ state }: { state: TrainerAPI }) {
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
