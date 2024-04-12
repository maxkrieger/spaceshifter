import { atom, useAtom, useAtomValue } from "jotai";
import {
  OptimizationParameters,
  defaultOptimizationParameters,
} from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { currentDatasetAtom } from "../lib/atoms";
import { db } from "../lib/db";
import { useCallback } from "react";

const exampleParametersAtom = atom<OptimizationParameters>(
  defaultOptimizationParameters
);

type SetParameter = <K extends keyof OptimizationParameters>(
  key: K,
  value: OptimizationParameters[K]
) => void;

export default function useParameters(): [
  OptimizationParameters,
  SetParameter
] {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const [exampleParams, setExampleParameters] = useAtom(exampleParametersAtom);
  const localParams = useLiveQuery(async () => {
    if (currentDataset.type === "local") {
      const params = await db.dataset.get(currentDataset.id);
      if (params) {
        return params.trainingParams;
      }
    }
    return null;
  }, [currentDataset]);
  const setParameter: SetParameter = useCallback(
    async (key, value) => {
      if (currentDataset.type === "local" && localParams) {
        await db.dataset.update(currentDataset.id, {
          trainingParams: { ...localParams, [key]: value },
        });
      }
    },
    [currentDataset, localParams]
  );
  const setExampleParameter: SetParameter = useCallback(
    (key, value) => {
      setExampleParameters((params) => ({ ...params, [key]: value }));
    },
    [setExampleParameters]
  );
  const local = currentDataset.type === "local";
  return [
    local && localParams ? localParams : exampleParams,
    local ? setParameter : setExampleParameter,
  ];
}
