import { currentDatasetAtom } from "@/lib/atoms";
import { useSetAtom } from "jotai";
import DataViewer from "./DataViewer";
import Trainer from "./Trainer";
import useProject from "@/lib/useDataset";
import Pretraining from "./Pretraining";

export default function Project() {
  const setCurrentProject = useSetAtom(currentDatasetAtom);
  const projectValue = useProject();
  if (!projectValue) {
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
          {projectValue.name}
        </h1>
      </div>
      <DataViewer />
      <Pretraining />
      <Trainer />
    </div>
  );
}
