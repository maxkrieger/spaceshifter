import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function TooltipWrapper({
  children,
  tooltip,
  asChild = false,
}: {
  children: ReactNode;
  tooltip: string;
  asChild?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="flex-shrink-0" asChild={asChild}>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-[200px]">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
