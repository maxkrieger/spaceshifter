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
import { Settings } from "lucide-react";
import { ProjectPhase, defaultOptimizationParameters } from "@/lib/types";
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
import { DatasetRow } from "./DatasetRow";

const cardStyle =
  "border border-slate-500 bg-slate-900 rounded-md p-4 m-2 flex-1 min-w-[300px]";

export default function ProjectPanel() {
  const localDatasets = useLiveQuery(async () => {
    const ds = await db.dataset.toArray();
    return ds;
  });
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
              name="City Facts JSON"
              locator={{
                type: "example",
                datasetURL:
                  "https://gistcdn.githack.com/maxkrieger/33434e8ee941a47e921f6c5b78566d1b/raw/d76524287bcf2446ebd0f290c97090003d184ce8/cities_dataset.json",
                embeddingsURL:
                  "https://gistcdn.githack.com/maxkrieger/e411a7c77b7af9c81844bb1fbcf9e117/raw/2b897bdc58433d78254de6982140945698eb74bf/cities_embeddings.json",
                name: "City Facts JSON",
              }}
            />
            <DatasetRow
              name="MNLI Logical Entailment"
              locator={{
                type: "example",
                datasetURL:
                  "https://gistcdn.githack.com/maxkrieger/42dd79326c56c1260def996f2f3a26e7/raw/0260dd24e28a171513f86756a3ac0470b4cef8f6/mnli_dataset.json",
                embeddingsURL:
                  "https://gistcdn.githack.com/maxkrieger/42dd79326c56c1260def996f2f3a26e7/raw/0260dd24e28a171513f86756a3ac0470b4cef8f6/mnli_embeddings.json",
                name: "MNLI Logical Entailment",
              }}
            />
            <DatasetRow
              name="StackOverflow Title and Question SQL"
              locator={{
                type: "example",
                datasetURL:
                  "https://gistcdn.githack.com/maxkrieger/92e177867627e85e75b40c3733fd9ceb/raw/3cee4ff498b71ac8371e2c71bbae9df34fae958e/sql_dataset.json",
                embeddingsURL:
                  "https://gistcdn.githack.com/maxkrieger/92e177867627e85e75b40c3733fd9ceb/raw/3cee4ff498b71ac8371e2c71bbae9df34fae958e/sql_embeddings.json",
                name: "StackOverflow Title and Question SQL",
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
      </div>
    </ThemeProvider>
  );
}
