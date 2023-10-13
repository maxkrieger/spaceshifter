import log from "loglevel";
import TrainingWorker from "@/lib/TrainingWorker.ts?worker";
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
  constructor() {
    this.worker = new TrainingWorker();
  }
  terminate() {
    log.info("Terminating worker");
    this.worker.terminate();
  }
}
