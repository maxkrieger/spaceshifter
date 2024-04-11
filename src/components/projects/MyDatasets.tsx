import { datasetPanelStyles } from "@/lib/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Settings } from "lucide-react";
import { sortBy } from "lodash";
import { DatasetRow } from "./DatasetRow";
import ApiKey from "./ApiKey";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useAtom } from "jotai";
import { apiKeyAtom } from "@/lib/atoms";

import CreateDataset from "./CreateDataset";

export default function MyDatasets() {
  const [apiKey, setAPIKey] = useAtom(apiKeyAtom);

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
          <CreateDataset />
        </div>
      )}
    </div>
  );
}
