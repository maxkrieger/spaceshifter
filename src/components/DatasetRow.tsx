import { Button } from "./ui/button";
import { useSetAtom } from "jotai";
import {
  currentDatasetAtom,
  exampleDatasetAtom,
  projectPhaseAtom,
} from "@/lib/atoms";
import { ChevronRight } from "lucide-react";
import { DatasetLocator, Pairings, ProjectPhase } from "@/lib/types";
import { useCallback } from "react";
import { useToast } from "./ui/use-toast";

export function DatasetRow({
  name,
  locator,
}: {
  name: string;
  locator: DatasetLocator;
}) {
  const setCurrentDataset = useSetAtom(currentDatasetAtom);
  const setPhase = useSetAtom(projectPhaseAtom);
  const setExampleDataset = useSetAtom(exampleDatasetAtom);
  const { toast } = useToast();
  const selectDataset = useCallback(async () => {
    if (locator.type === "example") {
      const { dismiss } = toast({ title: "Loading example..." });
      const res = await fetch(locator.datasetURL);
      const dataset = (await res.json()) as Pairings;
      setExampleDataset(dataset);
      dismiss();
    }
    setPhase(ProjectPhase.DataPresent);
    setCurrentDataset(locator);
  }, [setCurrentDataset, setPhase, locator, setExampleDataset, toast]);
  return (
    <div className="mt-2">
      <Button
        variant="outline"
        className="w-full text-left justify-between text-l font-bold"
        onClick={selectDataset}
      >
        <div>{name}</div>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
