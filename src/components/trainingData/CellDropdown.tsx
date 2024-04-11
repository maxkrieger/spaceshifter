import { Pair, db } from "@/lib/db";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useCallback, useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useSetAtom } from "jotai";
import { projectPhaseAtom } from "@/lib/atoms";
import { ProjectPhase } from "@/types";
export default function CellDropdown({ row }: { row: Row<Pair> }) {
  const r = row.original;
  const [editing, setEditing] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [text1, setText1] = useState<string>(r.text_1);
  const [text2, setText2] = useState<string>(r.text_2);
  const [label, setLabel] = useState<number>(r.label);
  const setProjectPhase = useSetAtom(projectPhaseAtom);
  const submit = useCallback(async () => {
    await db.pair.update(r.id!, {
      text_1: text1,
      text_2: text2,
      label,
    });
    setEditing(false);
    setMenuOpen(false);
    setProjectPhase(ProjectPhase.DataPresent);
  }, [text1, text2, label, r, setProjectPhase]);
  const deleteRow = useCallback(async () => {
    await db.pair.delete(r.id!);
    setDeleting(false);
    setMenuOpen(false);
    setProjectPhase(ProjectPhase.DataPresent);
  }, [r, setProjectPhase]);
  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="text-white">Edit Row</DialogHeader>
            <div className="text-white">
              <div className="my-4">
                <Label htmlFor="text_1">text_1</Label>
                <Input
                  type="text"
                  className="text-white mt-1"
                  id="text_1"
                  placeholder="text_1"
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                />
              </div>
              <div className="my-4">
                <Label htmlFor="text_2">text_2</Label>
                <Input
                  id="text_2"
                  type="text"
                  className="text-white mt-1"
                  placeholder="text_2"
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                />
              </div>
              <div className="my-4 flex items-center space-x-2">
                <Switch
                  id="label"
                  checked={label === 1}
                  onCheckedChange={(ch) => setLabel(ch ? 1 : -1)}
                />
                <Label htmlFor="label">
                  Currently {label === 1 ? "Positive" : "Negative"}
                </Label>
              </div>
              <Button onClick={submit}>save</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={deleting} onOpenChange={setDeleting}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Delete
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="max-w-[425px]">
            <DialogHeader className="text-white">
              Delete "{r.text_1.substring(0, 20)}"?
            </DialogHeader>
            <div className="flex justify-end space-x-3">
              <Button variant="destructive" onClick={deleteRow}>
                Delete
              </Button>
              <Button
                variant="outline"
                className="text-white"
                onClick={() => setDeleting(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
