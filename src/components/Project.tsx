import { currentDatasetAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import DataViewer from "./DataViewer";
import Trainer from "./Trainer";
import Pretraining from "./Pretraining";
import useDataset from "@/lib/useDataset";
import MatrixViewer from "./MatrixViewer";
import { Button } from "./ui/button";
import { TrashIcon } from "lucide-react";

export default function Project() {
  const [currentDataset, setCurrentDataset] = useAtom(currentDatasetAtom);
  const datasetName =
    useDataset()?.name ??
    (currentDataset?.type === "example" ? currentDataset.name : null);
  if (!datasetName) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <div className="flex flex-row justify-between">
        <h1 className="text-3xl">
          <span
            className="text-slate-500 text-2xl button cursor-pointer"
            onClick={() => setCurrentDataset(null)}
          >
            projects/
          </span>
          {datasetName}
        </h1>
        <div>
          {currentDataset?.type === "local" && (
            <Button variant="ghost">
              <TrashIcon size={15} className="opacity-50" />
            </Button>
          )}
        </div>
      </div>
      <DataViewer />
      <Pretraining />
      <Trainer />
      <MatrixViewer />
    </div>
  );
}
