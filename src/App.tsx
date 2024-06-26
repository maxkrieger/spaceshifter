import { useAtom } from "jotai";
import { currentDatasetAtom } from "./lib/atoms";
import logotype from "./assets/logotype.svg";
import logo from "./assets/logo.svg";
import Project from "./pages/Project";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Home from "./pages/Home";

function App() {
  const [currentDataset, setCurrentDataset] = useAtom(currentDatasetAtom);

  return (
    <TooltipProvider>
      <div className="p-5 text-white">
        <button
          className="button"
          onClick={() => setCurrentDataset({ type: "none" })}
        >
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
        {currentDataset.type === "none" ? <Home /> : <Project />}
        <Toaster />
        <footer className="mt-[100px]">
          <div className="text-center text-sm text-slate-400">
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
