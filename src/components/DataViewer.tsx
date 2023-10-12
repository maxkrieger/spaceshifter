import { db } from "@/lib/db";
import { Pairings, ProjectLocator } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import Dropzone from "./Dropzone";
import { useCallback, useState } from "react";
import { DataTable } from "./DataTable";

import CellDropdown from "./CellDropdown";

export default function DataViewer({
  currentProject,
}: {
  currentProject: ProjectLocator;
}) {
  const pairs = useLiveQuery(async () => {
    if (currentProject?.type === "local") {
      const pairs = await db.pair
        .where("project")
        .equals(currentProject.id)
        .toArray();
      return pairs;
    }
    return null;
  }, [currentProject]);

  const addRows = useCallback(
    (rows: Pairings) => {
      (async () => {
        if (currentProject?.type === "local") {
          await db.pair.bulkAdd(
            rows.map((pairing) => ({
              ...pairing,
              project: currentProject.id,
              dateCreated: new Date(),
            }))
          );
        }
      })();
    },
    [currentProject]
  );
  const [showDropzone, setShowDropzone] = useState<boolean>(false);
  const dropzoneVisible = !pairs || pairs.length === 0 || showDropzone;
  return (
    <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
      <h1 className="text-2xl">Dataset</h1>
      <p className="text-slate-400 text-l my-2">
        To train a spaceshifting matrix, provide 100-5,000 text pairs you want
        to be <span className="text-white">close together (1)</span> or{" "}
        <span className="text-white">far apart (-1)</span>.
      </p>
      {dropzoneVisible ? (
        <Dropzone addRows={addRows} />
      ) : (
        <div>
          <DataTable
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
