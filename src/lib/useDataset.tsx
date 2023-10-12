import { useAtomValue } from "jotai";
import { currentDatasetAtom } from "./atoms";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

export default function useDataset() {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const datasetValue = useLiveQuery(async () => {
    if (currentDataset?.type === "local") {
      const dataset = await db.dataset.get(currentDataset.id);
      return dataset;
    }
    return null;
  }, [currentDataset]);
  return datasetValue;
}
