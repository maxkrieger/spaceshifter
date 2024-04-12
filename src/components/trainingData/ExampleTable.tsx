import { DataTable } from "./DataTable";
import usePairings from "@/hooks/usePairings";

export function ExampleTable() {
  const pairings = usePairings();
  return (
    <DataTable
      buttons={<div />}
      columns={[
        { accessorKey: "text_1", header: "text_1", size: 1 / 3 },
        { accessorKey: "text_2", header: "text_2", size: 1 / 3 },
        { accessorKey: "label", header: "label", size: 1 / 4 },
      ]}
      data={pairings}
    />
  );
}
