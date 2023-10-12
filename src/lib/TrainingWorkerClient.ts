import log from "loglevel";
import TrainingWorker from "./TrainingWorker?worker";
import { OutboundMessage, TrainerMessage } from "./types";
export default class TrainingWorkerClient {
  worker: Worker;
  sendMessage(message: TrainerMessage) {
    this.worker.postMessage(message);
  }
  constructor(apiKey: string, onMessage: (m: OutboundMessage) => void) {
    this.worker = new TrainingWorker();
    this.sendMessage({ type: "setApiKey", apiKey });
    this.worker.addEventListener(
      "message",
      (e: MessageEvent<OutboundMessage>) => {
        onMessage(e.data);
      }
    );
  }
  terminate() {
    log.info("Terminating worker");
    this.worker.terminate();
  }
}
