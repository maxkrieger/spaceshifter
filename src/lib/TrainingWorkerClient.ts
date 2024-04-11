import log from "loglevel";
import TrainingWorker from "@/lib/TrainingWorker.ts?worker";
import { OutboundMessage, TrainerMessage } from "../types";
export default class TrainingWorkerClient {
  worker: Worker;
  sendMessage(message: TrainerMessage) {
    this.worker.postMessage(message);
  }
  /**
   * Listens for messages from the worker
   * @returns Cancel function
   */
  addListener(listener: (message: OutboundMessage) => void) {
    function handler(e: MessageEvent<OutboundMessage>) {
      listener(e.data);
    }
    this.worker.addEventListener("message", handler);
    return () => {
      this.worker.removeEventListener("message", handler);
    };
  }
  constructor() {
    this.worker = new TrainingWorker();
  }
  terminate() {
    log.info("Terminating worker");
    this.worker.terminate();
  }
}
