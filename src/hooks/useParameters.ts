import { useAtom, useAtomValue } from "jotai";
import { OptimizationParameters } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { currentDatasetAtom, exampleParametersAtom } from "../lib/atoms";
import { db } from "../lib/db";
import { useCallback } from "react";

/**
 *
 * @returns [parameters, setParameters(parameters)]
 */
export default function useParameters(): [
  OptimizationParameters,
  (params: OptimizationParameters) => void
] {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const [exampleParams, setExampleParameters] = useAtom<OptimizationParameters>(
    exampleParametersAtom
  );
  const localParams = useLiveQuery(async () => {
    if (currentDataset.type === "local") {
      const params = await db.dataset.get(currentDataset.id);
      if (params) {
        return params.trainingParams;
      }
    }
    return null;
  }, [currentDataset]);
  const setParams = useCallback(
    async (parameters: OptimizationParameters) => {
      if (currentDataset.type === "local") {
        await db.dataset.update(currentDataset.id, {
          trainingParams: parameters,
        });
      }
    },
    [currentDataset]
  );
  const local = currentDataset.type === "local";
  return [
    local && localParams ? localParams : exampleParams,
    local ? setParams : setExampleParameters,
  ];
}
