import { PerformanceGroup, ProjectPhase } from "@/lib/types";
import PretrainingSetup from "./PretrainingSetup";
import { useAtomValue } from "jotai";
import { projectPhaseAtom } from "@/lib/atoms";
import { useCallback, useState } from "react";
import Histogram from "./Histogram";

export default function Pretraining() {
  const currentPhase = useAtomValue(projectPhaseAtom);
  const [initialPerformance, setInitialPerformance] = useState<{
    perf: PerformanceGroup;
    testSize: number;
    trainSize: number;
  } | null>();
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
      <p>
        The test set has {initialPerformance.testSize} pairs and the train set
        has {initialPerformance.trainSize} pairs.
      </p>
      <p>
        The test set performance is{" "}
        {initialPerformance.perf.testAccuracyAndSE.message}
      </p>
      <Histogram pairings={initialPerformance.perf.trainCosinePairings} />
      <Histogram pairings={initialPerformance.perf.testCosinePairings} />
    </div>
  );
}
