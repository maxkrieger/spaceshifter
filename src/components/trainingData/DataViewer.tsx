import { db } from "@/lib/db";
import { Pairings } from "@/types";
import Dropzone from "./Dropzone";
import { useCallback } from "react";
import { DataTable } from "./DataTable";

import CellEditor from "./CellEditor";
import { useAtomValue } from "jotai";
import { currentDatasetAtom } from "@/lib/atoms";
import { cardStyles } from "@/lib/const";
import TableButtons from "./TableButtons";
import usePairings from "@/hooks/usePairings";
import useResetTrainer from "@/hooks/useResetTrainer";

export default function DataViewer() {
  const currentDataset = useAtomValue(currentDatasetAtom);
  const readonly = currentDataset.type !== "local";
  const pairings = usePairings();
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
  const downloadJSON = useCallback(() => {
    const cleaned = pairings.map(({ text_1, text_2, label }) => ({
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
  }, [pairings]);
  const dropzoneVisible = !readonly && pairings.length === 0;
  return (
    <div className={cardStyles}>
      <h1 className="text-2xl">Dataset</h1>
      <p className="text-slate-300 text-l my-2">
        To train a bias matrix, provide 100+ text pairs you want to be{" "}
        <span className="text-white">close together (1)</span> or{" "}
        <span className="text-white">far apart (-1)</span> in the resultant
        embedding space.
      </p>
      {dropzoneVisible ? (
        <Dropzone addRows={addRows} />
      ) : (
        <div>
          <DataTable
            buttons={
              !readonly ? (
                <TableButtons
                  onAddPairing={(pairing) => addRows([pairing])}
                  onDownload={downloadJSON}
                />
              ) : (
                <div />
              )
            }
            columns={[
              { accessorKey: "text_1", header: "text_1", size: 1 / 3 },
              { accessorKey: "text_2", header: "text_2", size: 1 / 3 },
              { accessorKey: "label", header: "label", size: 1 / 4 },
              ...(!readonly
                ? [
                    {
                      id: "actions",
                      cell: CellEditor,
                    },
                  ]
                : []),
            ]}
            data={pairings}
          />
        </div>
      )}
    </div>
  );
}
