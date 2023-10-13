import { currentDatasetAtom } from "@/lib/atoms";
import { useSetAtom } from "jotai";
import DataViewer from "./DataViewer";
import Trainer from "./Trainer";
import Pretraining from "./Pretraining";
import useDataset from "@/lib/useDataset";
import MatrixViewer from "./MatrixViewer";

export default function Project() {
  const setCurrentProject = useSetAtom(currentDatasetAtom);
  const datasetValue = useDataset();
  if (!datasetValue) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <div>
        <h1 className="text-3xl">
          <span
            className="text-slate-500 text-2xl button cursor-pointer"
            onClick={() => setCurrentProject(null)}
          >
            projects/
          </span>
          {datasetValue.name}
        </h1>
      </div>
      <DataViewer />
      <Pretraining />
      <Trainer />
      <MatrixViewer />
    </div>
  );
}
