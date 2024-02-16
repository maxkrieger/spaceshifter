"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { DownloadIcon, PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { Pairing } from "@/lib/types";
import { useCallback, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  submit,
  readonly,
  onDownload,
}: DataTableProps<TData, TValue> & {
  submit: (content: Pairing) => void;
  readonly: boolean;
  onDownload: () => void;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });
  const [text1, setText1] = useState<string>("");
  const [text2, setText2] = useState<string>("");
  const [label, setLabel] = useState<1 | -1>(1);
  const [open, setOpen] = useState<boolean>(false);
  const onSubmit = useCallback(() => {
    submit({ text_1: text1, text_2: text2, label });
    setOpen(false);
  }, [submit, text1, text2, label]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 py-4">
          {!readonly && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant={"outline"} className="flex items-center">
                  <PlusIcon size={18} className="mr-2" /> Create Row
                </Button>
              </DialogTrigger>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={onDownload}
              >
                <DownloadIcon size={18} className="mr-2" /> Download JSON
              </Button>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="text-white">Create Row</DialogHeader>
                <div className="text-white">
                  <Label htmlFor="text_1">text_1</Label>
                  <Input
                    placeholder="text_1"
                    id="text_1"
                    value={text1}
                    onChange={(e) => setText1(e.target.value)}
                  />
                  <Label htmlFor="text_2">text_2</Label>
                  <Input
                    placeholder="text_2"
                    id="text_2"
                    value={text2}
                    onChange={(e) => setText2(e.target.value)}
                  />
                  <div className="my-4 flex items-center space-x-2">
                    <Switch
                      id="label"
                      checked={label === 1}
                      onCheckedChange={(ch) => setLabel(ch ? 1 : -1)}
                    />
                    <Label htmlFor="label">
                      Currently {label === 1 ? "Positive" : "Negative"}
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={onSubmit} type="submit">
                    save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex items-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div>
            {table.getState().pagination.pageIndex + 1}/
            <span className="text-slate-500">{table.getPageCount()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
