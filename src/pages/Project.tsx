import { currentDatasetAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import DataViewer from "../components/trainingData/DataViewer";
import Trainer from "../components/training/Trainer";
import Pretraining from "../components/pretraining/Pretraining";
import MatrixViewer from "../components/MatrixViewer";
import { Button } from "../components/ui/button";
import { TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { useCallback } from "react";
import { db } from "@/lib/db";
import { useToast } from "../components/ui/use-toast";
import { DialogClose } from "@radix-ui/react-dialog";
import { useLiveQuery } from "dexie-react-hooks";

export default function Project() {
  const [currentDataset, setCurrentDataset] = useAtom(currentDatasetAtom);

  const datasetName = useLiveQuery(async () => {
    if (currentDataset.type === "local") {
      const dataset = await db.dataset.get(currentDataset.id);
      return dataset?.name;
    } else if (currentDataset.type === "example") {
      return currentDataset.name;
    }
  }, [currentDataset]);

  const { toast } = useToast();

  const deleteProject = useCallback(async () => {
    if (currentDataset.type === "local") {
      const { dismiss } = toast({ title: "Deleting dataset..." });
      await db.deleteDataset(currentDataset.id);
      dismiss();
      setCurrentDataset({ type: "none" });
    }
  }, [currentDataset, setCurrentDataset, toast]);

  if (!datasetName) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <div className="flex flex-row justify-between">
        <h1 className="text-3xl">
          <span
            className="text-slate-500 text-2xl button cursor-pointer"
            onClick={() => setCurrentDataset({ type: "none" })}
          >
            projects/
          </span>
          {datasetName}
        </h1>
        <div>
          {currentDataset.type === "local" && (
            <Dialog>
              <DialogTrigger>
                <TrashIcon size={15} className="opacity-50" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Delete {datasetName}?
                  </DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={deleteProject}>
                    Delete
                  </Button>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      type="submit"
                      className="text-white"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <DataViewer />
      <Pretraining />
      <Trainer />
      <MatrixViewer />
    </div>
  );
}
