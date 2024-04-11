import { useCallback, useState } from "react";
import { DownloadIcon, PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Pairing } from "@/lib/types";

export default function TableButtons({
  onAddPairing,
  onDownload,
}: {
  onAddPairing: (pairing: Pairing) => void;
  onDownload: () => void;
}) {
  const [text_1, setText1] = useState<string>("");
  const [text_2, setText2] = useState<string>("");
  const [label, setLabel] = useState<1 | -1>(1);
  const [open, setOpen] = useState<boolean>(false);
  const onSubmit = useCallback(() => {
    onAddPairing({ text_1, text_2, label });
    setOpen(false);
  }, [onAddPairing, text_1, text_2, label]);
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onSubmit();
    }
  }
  return (
    <div className="flex items-center space-x-2 py-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={"outline"} className="flex items-center">
            <PlusIcon size={18} className="mr-2" /> Create Row
          </Button>
        </DialogTrigger>
        <Button
          variant="outline"
          className="flex items-center"
          onClick={onDownload}
        >
          <DownloadIcon size={18} className="mr-2" /> Download JSON
        </Button>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="text-white">Create Row</DialogHeader>
          <div className="text-white">
            <Label htmlFor="text_1">text_1</Label>
            <Input
              placeholder="text_1"
              id="text_1"
              value={text_1}
              onChange={(e) => setText1(e.target.value)}
              onKeyDown={handleKey}
            />
            <Label htmlFor="text_2">text_2</Label>
            <Input
              placeholder="text_2"
              id="text_2"
              value={text_2}
              onChange={(e) => setText2(e.target.value)}
              onKeyDown={handleKey}
            />
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
          </div>
          <DialogFooter>
            <Button onClick={onSubmit} type="submit">
              save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
