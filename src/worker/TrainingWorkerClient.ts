import log from "loglevel";
import TrainingWorker from "@/worker/TrainingWorker.ts?worker";
import { MessageFromTrainer, MessageToTrainer } from "../types";
export default class TrainingWorkerClient {
  worker: Worker;
  sendMessage(message: MessageToTrainer) {
    this.worker.postMessage(message);
  }
  /**
   * Listens for messages from the worker
   * @returns Cancel function
   */
  addListener(listener: (message: MessageFromTrainer) => void) {
    function handler(e: MessageEvent<MessageFromTrainer>) {
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
