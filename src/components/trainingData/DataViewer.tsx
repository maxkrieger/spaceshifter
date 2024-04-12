import { useAtomValue } from "jotai";
import { currentDatasetAtom } from "@/lib/atoms";
import { cardStyles } from "@/lib/const";
import { LocalTable } from "./LocalTable";
import { ExampleTable } from "./ExampleTable";

export default function DataViewer() {
  const currentDataset = useAtomValue(currentDatasetAtom);

  return (
    <div className={cardStyles}>
      <h1 className="text-2xl">Dataset</h1>
      <p className="text-slate-300 text-l my-2">
        To train a bias matrix, provide 100+ text pairs you want to be{" "}
        <span className="text-white">close together (1)</span> or{" "}
        <span className="text-white">far apart (-1)</span> in the resultant
        embedding space.
      </p>
      {currentDataset.type === "local" ? <LocalTable /> : <ExampleTable />}
    </div>
  );
}
