import { currentDatasetAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import DataViewer from "./DataViewer";
import Trainer from "./Trainer";
import Pretraining from "./Pretraining";
import useDataset from "@/lib/useDataset";
import MatrixViewer from "./MatrixViewer";
import { Button } from "./ui/button";
import { TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useCallback } from "react";
import { db } from "@/lib/db";
import { useToast } from "./ui/use-toast";
import { DialogClose } from "@radix-ui/react-dialog";

export default function Project() {
  const [currentDataset, setCurrentDataset] = useAtom(currentDatasetAtom);

  const datasetName =
    useDataset()?.name ??
    (currentDataset?.type === "example" ? currentDataset.name : null);
  const { toast } = useToast();
  const deleteProject = useCallback(() => {
    (async () => {
      if (currentDataset?.type === "local") {
        const { dismiss } = toast({ title: "Deleting dataset..." });
        await db.deleteDataset(currentDataset.id);
        dismiss();
        setCurrentDataset(null);
      }
    })();
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
            onClick={() => setCurrentDataset(null)}
          >
            projects/
          </span>
          {datasetName}
        </h1>
        <div>
          {currentDataset?.type === "local" && (
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
