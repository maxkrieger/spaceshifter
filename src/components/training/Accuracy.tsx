import { TrainerAPI } from "@/hooks/trainer/trainerState";

export function Accuracy({ state }: { state: TrainerAPI }) {
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
    <p className="text-slate-300 mt-6 mb-4">
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
