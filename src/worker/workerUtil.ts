import { MessageFromTrainer } from "@/types";

export function sendMessageToHost(message: MessageFromTrainer) {
  postMessage(message);
}
