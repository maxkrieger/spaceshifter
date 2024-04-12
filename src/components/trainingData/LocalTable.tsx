import { DBPairs, db } from "@/lib/db";
import { Pairings } from "@/types";
import Dropzone from "./Dropzone";
import { useCallback } from "react";
import { DataTable } from "./DataTable";
import CellEditor from "./CellEditor";
import { useAtomValue } from "jotai";
import { currentDatasetAtom } from "@/lib/atoms";
import TableButtons from "./TableButtons";
import useResetTrainer from "@/hooks/useResetTrainer";
import { useLiveQuery } from "dexie-react-hooks";

function useDownloadJSON(localPairs: DBPairs) {
  return useCallback(() => {
    if (!localPairs) {
      return;
    }
    const cleaned = localPairs.map(({ text_1, text_2, label }) => ({
      text_1,
      text_2,
      label,
    }));
    const json = JSON.stringify(cleaned, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
  }, [localPairs]);
}

export function LocalTable() {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const localPairs = useLiveQuery(async () => {
    if (currentDataset.type === "local") {
      const pairs = await db.pair
        .where("dataset")
        .equals(currentDataset.id)
        .toArray();

      return pairs;
    }
    return [];
  }, [currentDataset]);
  const resetTrainer = useResetTrainer();
  const addRows = useCallback(
    async (rows: Pairings) => {
      if (currentDataset.type === "local") {
        await db.pair.bulkAdd(
          rows.map((pairing) => ({
            ...pairing,
            dataset: currentDataset.id,
            dateCreated: new Date(),
          }))
        );
        // Reset the project to force regeneration
        resetTrainer();
      }
    },
    [currentDataset, resetTrainer]
  );
  const downloadJSON = useDownloadJSON(localPairs ?? []);

  const dropzoneVisible = localPairs?.length === 0;
  return dropzoneVisible ? (
    <Dropzone addRows={addRows} />
  ) : (
    <div>
      <DataTable
        buttons={
          <TableButtons
            onAddPairing={(pairing) => addRows([pairing])}
            onDownload={downloadJSON}
          />
        }
        columns={[
          { accessorKey: "text_1", header: "text_1", size: 1 / 3 },
          { accessorKey: "text_2", header: "text_2", size: 1 / 3 },
          { accessorKey: "label", header: "label", size: 1 / 4 },
          {
            id: "actions",
            cell: CellEditor,
          },
        ]}
        data={localPairs || []}
      />
    </div>
  );
}
