import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { Button } from "./ui/button";
import { useAtom, useSetAtom } from "jotai";
import { apiKeyAtom, currentDatasetAtom, projectPhaseAtom } from "@/lib/atoms";
import ApiKey from "./ApiKey";
import { ThemeProvider } from "./theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Settings, ChevronRight } from "lucide-react";
import {
  DatasetLocator,
  ProjectPhase,
  defaultOptimizationParameters,
} from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useCallback, useState } from "react";
import { sortBy } from "lodash";

const cardStyle =
  "border border-slate-500 bg-slate-900 rounded-md p-4 m-2 flex-1 min-w-[300px]";

function DatasetRow({
  name,
  locator,
}: {
  name: string;
  locator: DatasetLocator;
}) {
  const setCurrentDataset = useSetAtom(currentDatasetAtom);
  const setPhase = useSetAtom(projectPhaseAtom);
  const selectDataset = useCallback(() => {
    setPhase(ProjectPhase.DataPresent);
    setCurrentDataset(locator);
  }, [setCurrentDataset, setPhase, locator]);
  return (
    <div className="mt-2">
      <Button
        variant="outline"
        className="w-full text-left justify-between text-l font-bold"
        onClick={selectDataset}
      >
        <div>{name}</div>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
export default function ProjectPanel() {
  const localDatasets = useLiveQuery(async () => {
    const ds = await db.dataset.toArray();
    return ds;
  });
  const [apiKey, setAPIKey] = useAtom(apiKeyAtom);
  const [datasetTitle, setDatasetTitle] = useState<string>("");
  const setCurrentDataset = useSetAtom(currentDatasetAtom);
  const setPhase = useSetAtom(projectPhaseAtom);
  const onCreateDataset = useCallback(() => {
    (async () => {
      const dataset = await db.dataset.add({
        name: datasetTitle,
        dateCreated: new Date(),
        trainingParams: defaultOptimizationParameters,
      });
      setCurrentDataset({ type: "local", id: dataset as number });
      setPhase(ProjectPhase.NoData);
      setDatasetTitle("");
    })();
  }, [datasetTitle, setDatasetTitle, setCurrentDataset, setPhase]);
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="mx-auto my-3 max-w-4xl flex flex-row justify-center flex-wrap">
        <div className={cardStyle}>
          <div>
            <h1 className="text-xl font-bold mb-2">Example Datasets</h1>
            <hr className="border-0.5 border-slate-700" />
          </div>
          <div className="py-2">
            <DatasetRow
              name="MNLI Logical Entailment"
              locator={{
                type: "example",
                route: "mnli",
                name: "MNLI Logical Entailment",
              }}
            />
            <DatasetRow
              name="StackOverflow Title to SQL"
              locator={{
                type: "example",
                route: "sql",
                name: "StackOverflow Title to SQL",
              }}
            />
          </div>
        </div>
        <div className={cardStyle}>
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
                  <h2 className="text-slate-300 text-xl m-2">
                    No datasets yet
                  </h2>
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
                      placeholder="Dataset Title"
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
      </div>
    </ThemeProvider>
  );
}
