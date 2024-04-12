import { currentDatasetAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import DataViewer from "../components/trainingData/DataViewer";
import Trainer from "../components/training/Trainer";
import Pretraining from "../components/pretraining/Pretraining";
import MatrixViewer from "../components/MatrixViewer";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import ProjectDeleteButton from "@/components/ProjectDeleteButton";

export default function Project() {
  const [currentDataset, setCurrentDataset] = useAtom(currentDatasetAtom);

  const datasetName = useLiveQuery(async () => {
    if (currentDataset.type === "local") {
      const dataset = await db.dataset.get(currentDataset.id);
      return dataset?.name;
    } else if (currentDataset.type === "example") {
      return currentDataset.name;
    }
  }, [currentDataset]);

  if (!datasetName) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <div className="flex flex-row justify-between">
        <h1 className="text-3xl">
          <span
            className="text-slate-500 text-2xl button cursor-pointer"
            onClick={() => setCurrentDataset({ type: "none" })}
          >
            projects/
          </span>
          {datasetName}
        </h1>
        <div>
          {currentDataset.type === "local" && (
            <ProjectDeleteButton
              datasetName={datasetName}
              currentDataset={currentDataset}
            />
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
