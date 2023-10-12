import { useAtom } from "jotai";
import { currentProjectAtom } from "./lib/atoms";
import logotype from "./assets/logotype.svg";
import logo from "./assets/logo.svg";
import Hero from "./components/Hero";
import ProjectPanel from "./components/ProjectPanel";
import Project from "./components/Project";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);

  return (
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
    </div>
  );
}

export default App;
