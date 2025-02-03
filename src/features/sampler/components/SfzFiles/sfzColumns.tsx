// src/features/sampler/components/SfzFiles/sfzColumns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { SfzFileStatus } from "../../types.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/shadcn/ui/dropdown-menu";
import { Button } from "@/common/shadcn/ui/button.tsx";
import { MoreHorizontal } from "lucide-react";

export const sfzColumns: ColumnDef<SfzFileStatus>[] = [
  {
    accessorKey: "path",
    header: "Path",
  },
  {
    accessorKey: "loaded",
    header: "Loaded",
    cell: ({ row }) => (row.original.loaded ? "Yes" : "No"),
  },
  {
    accessorKey: "lastLoaded",
    header: "Last Loaded",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const status = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Load</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
