import { useCallback } from "react";
import ApiKey from "./components/ApiKey";
import { OutboundMessage } from "./lib/types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  apiKeyAtom,
  currentPerformanceAtom,
  currentProjectAtom,
  initialPerformanceAtom,
  trainingWorkerAtom,
} from "./lib/atoms";
import TrainingWorkerClient from "./lib/TrainingWorkerClient";
import logotype from "./assets/logotype.svg";
import logo from "./assets/logo.svg";
import Hero from "./components/Hero";
import ProjectPanel from "./components/ProjectPanel";

function App() {
  const apiKey = useAtomValue(apiKeyAtom);
  const [workerClient, setWorkerClient] = useAtom(trainingWorkerAtom);
  const setCurrentPerformance = useSetAtom(currentPerformanceAtom);
  const setInitialPerformance = useSetAtom(initialPerformanceAtom);
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  // todo: represent how?
  const onWorkerMessage = useCallback(
    (message: OutboundMessage) => {
      switch (message.type) {
        case "initialPerformance":
          setInitialPerformance(message.performance);
          break;
        case "updatedPerformance":
          setCurrentPerformance(message.performance);
          break;
        case "embeddingProgress":
          console.log(message);
          break;
        default:
          break;
      }
      console.log(message);
    },
    [setCurrentPerformance, setInitialPerformance]
  );
  const initWorker = useCallback(() => {
    if (apiKey === null) {
      throw new Error("API key is null");
    }
    setWorkerClient(new TrainingWorkerClient(apiKey, onWorkerMessage));
  }, [apiKey, onWorkerMessage, setWorkerClient]);
  return (
    <div className="p-5 text-white">
      <div className="flex flex-row align-center py-3">
        <img src={logo} width={40} />
        <img className="ml-2" src={logotype} width={200} alt={"Spaceshifter"} />
      </div>
      {currentProject === null && (
        <div>
          <Hero />
          <ProjectPanel />
        </div>
      )}
    </div>
  );
}

export default App;
