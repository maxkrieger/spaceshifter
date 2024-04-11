import { datasetPanelStyles } from "@/lib/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Settings } from "lucide-react";
import { sortBy } from "lodash";
import { DatasetRow } from "./DatasetRow";
import ApiKey from "../ApiKey";
import { Button } from "../ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useAtom, useSetAtom } from "jotai";
import { apiKeyAtom, currentDatasetAtom, projectPhaseAtom } from "@/lib/atoms";
import { ProjectPhase, defaultOptimizationParameters } from "@/lib/types";

import { useCallback, useState } from "react";

export default function MyDatasets() {
  const [apiKey, setAPIKey] = useAtom(apiKeyAtom);
  const [datasetTitle, setDatasetTitle] = useState<string>("");
  const setCurrentDataset = useSetAtom(currentDatasetAtom);
  const setPhase = useSetAtom(projectPhaseAtom);

  const onCreateDataset = useCallback(async () => {
    const dataset = await db.dataset.add({
      name: datasetTitle,
      dateCreated: new Date(),
      trainingParams: defaultOptimizationParameters,
    });
    setCurrentDataset({ type: "local", id: dataset as number });
    setPhase(ProjectPhase.NoData);
    setDatasetTitle("");
  }, [datasetTitle, setCurrentDataset, setPhase]);

  const localDatasets = useLiveQuery(async () => {
    const ds = await db.dataset.toArray();
    return ds;
  });

  return (
    <div className={datasetPanelStyles}>
      <div className="flex flex-row justify-between items-center mb-2">
        <h1 className="text-xl font-bold">My Datasets</h1>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Settings size={20} strokeWidth={1} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setAPIKey(null)}>
              Reset API Key
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <hr className="border-0.5 border-slate-700" />
      {apiKey === null ? (
        <div className="text-center m-5">
          <h1 className="text-slate-300 text-xl m-2">No API Key Set</h1>
          <ApiKey />
        </div>
      ) : (
        <div>
          {localDatasets === undefined || localDatasets.length === 0 ? (
            <div className="text-center">
              <h2 className="text-slate-300 text-xl m-2">No datasets yet</h2>
            </div>
          ) : (
            sortBy(localDatasets, (ds) => -ds.dateCreated.getTime()).map(
              (ds) => (
                <DatasetRow
                  key={ds.id!}
                  name={ds.name}
                  locator={{ type: "local", id: ds.id! }}
                />
              )
            )
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="p-4 my-2 w-full">New Dataset</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] text-white">
              <DialogHeader>
                <DialogTitle>Create Dataset</DialogTitle>
              </DialogHeader>
              <div className="flex flex-row gap-3">
                <Input
                  type="text"
                  placeholder="Dataset Name"
                  value={datasetTitle}
                  onChange={(e) => setDatasetTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onCreateDataset()}
                />
                <Button onClick={onCreateDataset}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
