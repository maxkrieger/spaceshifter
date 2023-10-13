import { useAtom } from "jotai";
import { currentDatasetAtom } from "./lib/atoms";
import logotype from "./assets/logotype.svg";
import logo from "./assets/logo.svg";
import Hero from "./components/Hero";
import ProjectPanel from "./components/ProjectPanel";
import Project from "./components/Project";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  const [currentProject, setCurrentProject] = useAtom(currentDatasetAtom);

  return (
    <TooltipProvider>
      <div className="p-5 text-white">
        <button className="button" onClick={() => setCurrentProject(null)}>
          <div className="flex flex-row align-center py-3 ">
            <img src={logo} width={40} />
            <img
              className="ml-2"
              src={logotype}
              width={200}
              alt={"Spaceshifter"}
            />
          </div>
        </button>
        {currentProject === null ? (
          <div>
            <Hero />
            <ProjectPanel />
          </div>
        ) : (
          <Project />
        )}
        <Toaster />
        <footer className="mt-[100px]">
          <div className="text-center text-sm text-slate-500">
            adapted from the{" "}
            <a
              className="underline"
              href="https://github.com/openai/openai-cookbook/blob/main/examples/Customizing_embeddings.ipynb"
              target="_blank"
            >
              "Customizing embeddings" cookbook
            </a>{" "}
            by OpenAI.{" "}
            <a
              href="https://github.com/maxkrieger/spaceshifter"
              target="_blank"
              className="underline"
            >
              View source on GitHub
            </a>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
