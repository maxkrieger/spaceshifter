import { bestMatrixAtom, projectPhaseAtom } from "@/lib/atoms";
import { ProjectPhase } from "@/lib/types";
import { useAtomValue } from "jotai";
import { Button } from "./ui/button";
import { useCallback } from "react";
import { cardStyles } from "@/lib/const";
import { DownloadIcon } from "lucide-react";

export default function MatrixViewer() {
  const bestMatrix = useAtomValue(bestMatrixAtom);
  const projectPhase = useAtomValue(projectPhaseAtom);
  const downloadNumpy = useCallback(() => {
    const blob = new Blob([bestMatrix!.matrixNpy], {
      type: "application/octet-stream",
    });
    const link = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = "spaceshifted.npy";
    link.click();
    URL.revokeObjectURL(url);
    link.remove();
  }, [bestMatrix]);
  if (projectPhase < ProjectPhase.Trained || bestMatrix === null) {
    return (
      <div className={cardStyles + " opacity-50"}>
        <h1 className="text-2xl">Matrix</h1>
      </div>
    );
  }
  return (
    <div className={cardStyles}>
      <h1 className="text-2xl mb-3">Matrix</h1>
      <div>
        <div>
          <p className="text-slate-300">
            We trained a <span className="text-white">bias matrix</span> of size{" "}
            <span className="text-white">
              ({bestMatrix.shape[0]}, {bestMatrix.shape[1]})
            </span>
            .
          </p>
          <p className="text-slate-300">
            You can multiply it with vectors of size{" "}
            <span className="text-white">{bestMatrix.shape[0]}</span> to get{" "}
            <span className="text-purple-200">Spaceshifted</span> vectors of
            size <span className="text-white">{bestMatrix.shape[1]}</span>.
          </p>
        </div>
        <div className="flex flex-row flex-wrap my-3">
          <div>
            <h2 className="text-xl">Usage</h2>
            <div className="max-w-[500px] min-w-[200px] py-3 px-4 mt-1 text-left text-sm bg-slate-900 rounded-md border border-slate-500 font-mono inline-block">
              <span className="block">
                <span className="text-blue-300">import</span>{" "}
                <span className="text-red-300">numpy</span>{" "}
                <span className="text-blue-300">as</span>{" "}
                <span className="text-yellow-300">np</span>
              </span>
              <span className="block">
                <span className="text-yellow-300">M</span> ={" "}
                <span className="text-yellow-300">np</span>.
                <span className="text-blue-300">load</span>(
                <span className="text-red-300">"spaceshifted.npy"</span>,{" "}
                <span className="text-blue-300">allow_pickle</span>=
                <span className="text-green-300">True</span>)
              </span>
              <span className="block">
                <span className="text-yellow-300">v</span> ={" "}
                <span className="text-gray-300">
                  # vector of size ({bestMatrix.shape[0]},)
                </span>
              </span>
              <span className="block">
                <span className="text-yellow-300">M</span>{" "}
                <span className="text-purple-300">@</span>{" "}
                <span className="text-yellow-300">v</span>
              </span>
            </div>
          </div>
          <div className="flex justify-center items-center flex-1 my-4">
            <Button onClick={downloadNumpy}>
              <DownloadIcon size={20} className="mr-2" />{" "}
              <span className="whitespace-nowrap">download matrix</span>{" "}
              <span className="font-mono ml-1">spaceshifted.npy</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
