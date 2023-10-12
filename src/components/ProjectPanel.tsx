import { useLiveQuery } from "dexie-react-hooks";
import { Project, db } from "../lib/db";
import { Button } from "./ui/button";
import { useAtom, useSetAtom } from "jotai";
import { apiKeyAtom, currentProjectAtom } from "@/lib/atoms";
import ApiKey from "./ApiKey";
import { ThemeProvider } from "./theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Settings, ChevronRight } from "lucide-react";
import { ProjectLocator, defaultOptimizationParameters } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useCallback, useState } from "react";

const cardStyle =
  "border border-slate-500 bg-slate-900 rounded-md p-4 m-2 flex-1 min-w-[300px]";

function ProjectRow({
  name,
  locator,
}: {
  name: string;
  locator: ProjectLocator;
}) {
  const setCurrentProject = useSetAtom(currentProjectAtom);
  return (
    <div className="mt-2">
      <Button
        variant="outline"
        className="w-full text-left justify-between text-l font-bold"
        onClick={() => setCurrentProject(locator)}
      >
        <div>{name}</div>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
export default function ProjectPanel() {
  const projects = useLiveQuery(async () => {
    const projects_ = await db.project.toArray();
    return projects_;
  });
  const [apiKey, setAPIKey] = useAtom(apiKeyAtom);
  const [projectTitle, setProjectTitle] = useState<string>("");
  const setCurrentProject = useSetAtom(currentProjectAtom);
  const onCreateProject = useCallback(() => {
    (async () => {
      const project = await db.project.add({
        name: projectTitle,
        dateCreated: new Date(),
        trainingParams: defaultOptimizationParameters,
      });
      setCurrentProject({ type: "local", id: project as number });
      setProjectTitle("");
    })();
  }, [projectTitle, setProjectTitle, setCurrentProject]);
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="mx-auto my-3 max-w-4xl flex flex-row justify-center flex-wrap">
        <div className={cardStyle}>
          <div>
            <h1 className="text-xl font-bold mb-2">Examples</h1>
            <hr className="border-0.5 border-slate-700" />
          </div>
          <div className="py-2">
            <ProjectRow
              name="MNLI Logical Entailment"
              locator={{
                type: "example",
                route: "mnli",
                name: "MNLI Logical Entailment",
              }}
            />
            <ProjectRow
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
            <h1 className="text-xl font-bold">Projects</h1>
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
          ) : projects === undefined || projects.length === 0 ? (
            <div className="text-center">
              <h2 className="text-slate-300 text-xl m-2">No projects yet</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create project</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] text-white">
                  <DialogHeader>
                    <DialogTitle>Create project</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-row gap-3">
                    <Input
                      type="text"
                      placeholder="Project Title"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onCreateProject()}
                    />
                    <Button onClick={onCreateProject}>Create</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            projects.map((project: Project) => (
              <ProjectRow
                key={project.id!}
                name={project.name}
                locator={{ type: "local", id: project.id! }}
              />
            ))
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
