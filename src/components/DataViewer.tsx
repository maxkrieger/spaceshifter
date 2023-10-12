import { db } from "@/lib/db";
import { Pairings, ProjectPhase } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import Dropzone from "./Dropzone";
import { useCallback, useState } from "react";
import { DataTable } from "./DataTable";

import CellDropdown from "./CellDropdown";
import { useAtom, useAtomValue } from "jotai";
import { currentDatasetAtom, projectPhaseAtom } from "@/lib/atoms";

export default function DataViewer() {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const [projectPhase, setProjectPhase] = useAtom(projectPhaseAtom);
  const pairs = useLiveQuery(async () => {
    if (currentDataset?.type === "local") {
      const pairs = await db.pair
        .where("dataset")
        .equals(currentDataset.id)
        .toArray();
      // If it got preloaded
      if (pairs.length > 0 && projectPhase <= ProjectPhase.NoData) {
        setProjectPhase(ProjectPhase.DataPresent);
      }
      return pairs;
    }
    return null;
  }, [currentDataset, setProjectPhase, projectPhase]);

  const addRows = useCallback(
    (rows: Pairings) => {
      (async () => {
        if (currentDataset?.type === "local") {
          await db.pair.bulkAdd(
            rows.map((pairing) => ({
              ...pairing,
              dataset: currentDataset.id,
              dateCreated: new Date(),
            }))
          );
          // Reset the project phase to force regeneration
          setProjectPhase(ProjectPhase.DataPresent);
        }
      })();
    },
    [currentDataset, setProjectPhase]
  );
  const [showDropzone, setShowDropzone] = useState<boolean>(false);
  const dropzoneVisible = !pairs || pairs.length === 0 || showDropzone;
  return (
    <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
      <h1 className="text-2xl">Dataset</h1>
      <p className="text-slate-300 text-l my-2">
        To train a spaceshifting matrix, provide 100+ text pairs you want to be{" "}
        <span className="text-white">close together (1)</span> or{" "}
        <span className="text-white">far apart (-1)</span>.
      </p>
      {dropzoneVisible ? (
        <Dropzone addRows={addRows} />
      ) : (
        <div>
          <DataTable
            submit={(row) => addRows([row])}
            columns={[
              { accessorKey: "text_1", header: "text_1", size: 1 / 3 },
              { accessorKey: "text_2", header: "text_2", size: 1 / 3 },
              { accessorKey: "label", header: "label", size: 1 / 4 },
              {
                id: "actions",
                cell: CellDropdown,
              },
            ]}
            data={pairs}
          />
        </div>
      )}
    </div>
  );
}
