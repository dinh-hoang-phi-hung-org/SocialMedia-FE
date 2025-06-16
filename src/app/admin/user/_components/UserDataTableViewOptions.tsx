"use client";

import { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";

interface UserDataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export default function UserDataTableViewOptions<TData>({ table }: UserDataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <Settings2 />
          <LabelShadcn className="text-inherit" text="common:button.view" translate />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {/* <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator /> */}
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className=""
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                <LabelShadcn
                  translate
                  text={`user-management:fields.${column.id.replace(/([A-Z])/g, "-$1").toLowerCase()}`}
                />
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
