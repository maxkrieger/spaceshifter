import {
  apiKeyAtom,
  currentProjectAtom,
  trainingWorkerAtom,
} from "@/lib/atoms";
import { OutboundMessage } from "@/lib/types";
import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { useToast } from "./ui/use-toast";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import DataViewer from "./DataViewer";

export default function Project() {
  const [workerClient, setWorkerClient] = useAtom(trainingWorkerAtom);
  const apiKey = useAtomValue(apiKeyAtom);
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const projectValue = useLiveQuery(async () => {
    if (currentProject?.type === "local") {
      const project = await db.project.get(currentProject.id);
      return project;
    }
    return null;
  }, [currentProject]);
  const { toast } = useToast();
  const onWorkerMessage = useCallback(
    (message: OutboundMessage) => {
      switch (message.type) {
        case "initialPerformance":
          break;
        case "updatedPerformance":
          break;
        case "embeddingProgress":
          console.log(message);
          break;
        case "error":
          toast({
            title: "Error",
            description: message.message,
            variant: "destructive",
          });
          break;
        default:
          break;
      }
      console.log(message);
    },
    [toast]
  );
  if (!projectValue || !currentProject) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <div>
        <h1 className="text-3xl">
          <span
            className="text-slate-500 text-2xl button cursor-pointer"
            onClick={() => setCurrentProject(null)}
          >
            projects/
          </span>
          {projectValue.name}
        </h1>
      </div>
      <DataViewer currentProject={currentProject} />
    </div>
  );
}
