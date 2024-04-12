import { currentDatasetAtom } from "@/lib/atoms";
import { db } from "@/lib/db";
import { Pairings } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";
import { useAtomValue } from "jotai";

export default function usePairings(): Pairings {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const localPairs = useLiveQuery(async () => {
    if (currentDataset.type === "local") {
      const pairs = await db.pair
        .where("dataset")
        .equals(currentDataset.id)
        .toArray();

      return pairs as Pairings;
    }
    return null;
  }, [currentDataset]);
  const examplePairs =
    currentDataset.type === "example" ? currentDataset.pairings : null;
  if (localPairs) {
    return localPairs;
  }
  if (examplePairs) {
    return examplePairs;
  }
  return [];
}
