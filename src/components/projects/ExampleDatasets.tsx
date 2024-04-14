import { datasetPanelStyles, exampleDatasets } from "@/lib/const";
import { DatasetRow } from "./DatasetRow";

export default function ExampleDatasets() {
  return (
    <div className={datasetPanelStyles}>
      <div>
        <h1 className="text-xl font-bold mb-2">Example Datasets</h1>
        <hr className="border-0.5 border-slate-700" />
      </div>
      <div className="py-2">
        <DatasetRow
          name={exampleDatasets.cityFacts.name}
          locator={exampleDatasets.cityFacts}
        />
        <DatasetRow
          name={exampleDatasets.mnli.name}
          locator={exampleDatasets.mnli}
        />
        <DatasetRow
          name={exampleDatasets.stackoverflow.name}
          locator={exampleDatasets.stackoverflow}
        />
      </div>
    </div>
  );
}
