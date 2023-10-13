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
        <div className="text-center text-sm text-slate-500">
          based on the Bias Matrix notebook by OpenAI. Fork on GitHub
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
