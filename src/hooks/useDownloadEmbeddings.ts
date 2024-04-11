import { trainingWorkerAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import { useCallback } from "react";

export default function useDownloadEmbeddings() {
  const trainingWorker = useAtomValue(trainingWorkerAtom);
  const downloadEmbeddings = useCallback(() => {
    if (trainingWorker) {
      const cancel = trainingWorker.addListener((message) => {
        if (message.type === "dumpEmbeddingCache") {
          const blob = new Blob([JSON.stringify(message.cache)], {
            type: "text/json",
          });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);

          link.download = "embeddings.json";
          link.href = url;
          link.dataset.downloadurl = [
            "text/json",
            link.download,
            link.href,
          ].join(":");

          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          cancel();
        }
      });
      trainingWorker.sendMessage({ type: "getEmbeddingCache" });
    }
  }, [trainingWorker]);
  return downloadEmbeddings;
}
