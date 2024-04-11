import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { useCallback } from "react";
import { useToast } from "./ui/use-toast";
import { Pairings } from "@/lib/types";
import { parseCSV, parseJSON, parseJSONL } from "@/lib/parseData";
export default function Dropzone({
  addRows,
}: {
  addRows: (rows: Pairings) => void;
}) {
  const { toast } = useToast();
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file.name.endsWith("json")) {
        const parsed = await parseJSON(file);
        if (parsed) {
          addRows(parsed);
        } else {
          toast({ title: `Could not parse JSON ${file.name}` });
        }
      } else if (file.name.endsWith("jsonl")) {
        const parsed = await parseJSONL(file);
        if (parsed) {
          addRows(parsed);
        } else {
          toast({ title: `Could not parse JSONL ${file.name}` });
        }
      } else if (file.name.endsWith("csv")) {
        const parsed = await parseCSV(file);
        if (parsed) {
          addRows(parsed);
        } else {
          toast({ title: `Could not parse CSV ${file.name}` });
        }
      } else {
        toast({ title: `Could not identify file type of ${file.name}` });
      }
    },
    [addRows, toast]
  );
  const onManual = useCallback(() => {
    addRows([
      { text_1: "What is the capital of Peru?", text_2: "Lima", label: 1 },
    ]);
  }, [addRows]);
  const onDropRejected = useCallback(() => {
    toast({ title: `Could not handle file(s)` });
  }, [toast]);
  const { getRootProps, getInputProps, open, isFocused, isDragActive } =
    useDropzone({
      accept: {
        "text/json": [".json"],
        "text/jsonl": [".jsonl"],
        "text/csv": [".csv"],
      },
      noClick: true,
      noKeyboard: true,
      onDropAccepted: onDrop,
      onDropRejected: onDropRejected,
      maxFiles: 1,
    });
  return (
    <div>
      <div>
        <p className="text-slate-400 text-sm">
          Upload a JSON array, JSONL, or CSV file with rows having keys{" "}
          <span className="text-white font-mono">text_1</span>,{" "}
          <span className="text-white font-mono">text_2</span>, (strings) and{" "}
          <span className="text-white font-mono">label</span> (-1 | 1).
        </p>
        <p className="text-slate-400 text-sm">
          Order doesn't matter for the strings. The number of positive (1) pairs
          should be greater than or equal to the number of negative (-1) pairs.
          We can generate more negative pairs later.
        </p>
      </div>
      <div
        className={`border border-dashed flex padding-4 rounded-md ${
          isFocused || isDragActive ? "border-purple-300" : "border-slate-400"
        } text-slate-400 center-text my-3 p-3 flex flex-col justify-center items-center`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <p>Drag a json, jsonl, or csv file here</p>
        <div>
          <Button variant={"secondary"} className="m-2" onClick={open}>
            Upload
          </Button>
          <Button variant={"secondary"} className="m-2" onClick={onManual}>
            Enter Manually
          </Button>
        </div>
      </div>
    </div>
  );
}
