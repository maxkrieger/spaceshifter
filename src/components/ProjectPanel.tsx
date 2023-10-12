import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { Button } from "./ui/button";
import { useAtomValue } from "jotai";
import { apiKeyAtom } from "@/lib/atoms";
import ApiKey from "./ApiKey";
import { ThemeProvider } from "./theme-provider";

const cardStyle =
  "border border-slate-500 bg-slate-900 rounded-md p-4 m-2 flex-1 min-w-[300px]";
export default function ProjectPanel() {
  const projects = useLiveQuery(async () => {
    const projects_ = await db.project.toArray();
    return projects_;
  });
  const apiKey = useAtomValue(apiKeyAtom);
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="mx-auto my-3 max-w-4xl flex flex-row justify-center flex-wrap">
        <div className={cardStyle}>
          <h1 className="text-xl font-bold">Examples</h1>
        </div>
        <div className={cardStyle}>
          <h1 className="text-xl font-bold">Projects</h1>
          {apiKey === null ? (
            <ApiKey />
          ) : projects === undefined || projects.length === 0 ? (
            <div className="text-center">
              <h2 className="text-slate-300 text-xl m-2">No projects yet</h2>
              <Button>Create project</Button>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
