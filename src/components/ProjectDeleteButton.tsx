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
import { useSetAtom } from "jotai";
import { CurrentDataset } from "@/types";
import { currentDatasetAtom } from "@/lib/atoms";

export default function ProjectDeleteButton({
  datasetName,
  currentDataset,
}: {
  datasetName: string;
  currentDataset: CurrentDataset;
}) {
  const setCurrentDataset = useSetAtom(currentDatasetAtom);
  const { toast } = useToast();

  const deleteProject = useCallback(async () => {
    if (currentDataset.type === "local") {
      const { dismiss } = toast({ title: "Deleting dataset..." });
      await db.deleteDataset(currentDataset.id);
      dismiss();
      setCurrentDataset({ type: "none" });
    }
  }, [currentDataset, setCurrentDataset, toast]);

  return (
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
            <Button variant="outline" type="submit" className="text-white">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
