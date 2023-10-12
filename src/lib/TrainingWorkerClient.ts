import log from "loglevel";
import TrainingWorker from "./TrainingWorker?worker";
import { OutboundMessage, TrainerMessage } from "./types";
export default class TrainingWorkerClient {
  worker: Worker;
  sendMessage(message: TrainerMessage) {
    this.worker.postMessage(message);
  }
  addListener(listener: (message: OutboundMessage) => void) {
    this.worker.addEventListener(
      "message",
      (e: MessageEvent<OutboundMessage>) => {
        listener(e.data);
      }
    );
  }
  constructor(apiKey: string) {
    this.worker = new TrainingWorker();
    this.sendMessage({ type: "setApiKey", apiKey });
  }
  terminate() {
    log.info("Terminating worker");
    this.worker.terminate();
  }
}
