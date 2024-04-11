import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ProjectPhase, defaultOptimizationParameters } from "@/lib/types";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { useSetAtom } from "jotai";
import { currentDatasetAtom, projectPhaseAtom } from "@/lib/atoms";
import { db } from "@/lib/db";

export default function CreateDataset() {
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
  return (
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
  );
}
