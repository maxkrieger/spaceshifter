import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function TooltipWrapper({
  children,
  tooltip,
}: {
  children: ReactNode;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="flex-shrink-0">{children}</TooltipTrigger>
      <TooltipContent>
        <p className="max-w-[200px]">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
