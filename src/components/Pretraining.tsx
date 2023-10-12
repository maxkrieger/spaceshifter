import { PerformanceGroup, ProjectPhase } from "@/lib/types";
import PretrainingSetup from "./PretrainingSetup";
import { useAtomValue } from "jotai";
import { projectPhaseAtom } from "@/lib/atoms";
import { useCallback, useState } from "react";
import Histogram from "./Histogram";

export default function Pretraining() {
  const currentPhase = useAtomValue(projectPhaseAtom);
  const [initialPerformance, setInitialPerformance] =
    useState<PerformanceGroup | null>();
  if (currentPhase < ProjectPhase.DataPresent) {
    return (
      <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5 opacity-50">
        <h1 className="text-2xl">Embeddings</h1>
      </div>
    );
  }
  if (currentPhase < ProjectPhase.Embedded) {
    return <PretrainingSetup setPerformance={setInitialPerformance} />;
  }
  if (!initialPerformance) {
    return <div>loading...</div>;
  }

  return (
    <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
      <h1 className="text-2xl">Pretraining</h1>
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
      <Histogram
        trainPairings={initialPerformance.trainCosinePairings}
        testPairings={initialPerformance.testCosinePairings}
      />
    </div>
  );
}
