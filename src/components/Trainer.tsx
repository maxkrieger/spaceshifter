import { useAtom } from "jotai";
import { useToast } from "./ui/use-toast";
import { projectPhaseAtom } from "@/lib/atoms";
import { ProjectPhase } from "@/lib/types";

export default function Trainer() {
  const { toast } = useToast();
  const [projectPhase, setProjectPhase] = useAtom(projectPhaseAtom);

  if (projectPhase < ProjectPhase.Embedded) {
    return (
      <div className="opacity-50 border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
        <h1 className="text-2xl">Training</h1>
      </div>
    );
  }
  return (
    <div className="border bg-slate-900 border-slate-500 rounded-md p-4 my-5">
      <h1 className="text-2xl">Training</h1>
    </div>
  );
}
