"use client";

import * as React from "react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

import { FilterProperty, SortProperty } from "@/shared/types/common-type/shared-types";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import UserDataTablePagination from "./UserDataTablePagination";
import { Skeleton } from "@/shared/components/ui/skeleton";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import UserDataTableToolbar from "./UserDataToolbar";
import { DropdownOption } from "@/shared/types/components-type/drop-down-type";
import { changeTextCasesToAnother } from "@/shared/helpers/kebab";
interface DataTableProps<TData, TValue> {
  readonly columns: ColumnDef<TData, TValue>[];
  readonly data: TData[];
  readonly recordPerPageOptions: DropdownOption[];
  readonly recordPerPage: number;
  readonly setRecordPerPage: (recordPerPage: number) => void;
  readonly onPageChange: (page: number) => void;
  readonly currentPage: number;
  readonly lastPage: number;
  //   readonly onRowClick: (row: TData) => void;
  readonly filter: FilterProperty;
  readonly setFilter: (filter: FilterProperty) => void;
  readonly sort: SortProperty;
  readonly setSort: (sort: SortProperty) => void;
  readonly loading: boolean;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  recordPerPageOptions,
  recordPerPage,
  setRecordPerPage,
  currentPage,
  lastPage,
  onPageChange,
  //   onRowClick,
  filter,
  setFilter,
  sort,
  setSort,
  loading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  console.log("table", table.getRowModel().rows);

  const handleSort = (columnName: string) => {
    const direction = sort.direction;
    columnName =
      columnName === "username" || columnName === "email" || columnName === "gender" || columnName === "createdAt"
        ? columnName
        : changeTextCasesToAnother({ input: columnName, fromCase: "camelCase", toCase: "snake_case" });
    if (sort.key == "") {
      setSort({ key: columnName, direction: "desc" });
    } else if (direction === "desc") {
      setSort({ key: columnName, direction: "asc" });
    } else {
      setSort({ key: "", direction: "default" });
    }
  };

  const sortingElement = (columnName: string) => {
    const transformedColumnName =
      columnName === "username" || columnName === "email" || columnName === "gender" || columnName === "createdAt"
        ? columnName
        : changeTextCasesToAnother({ input: columnName, fromCase: "camelCase", toCase: "snake_case" });

    return (
      <div>
        {sort.key === transformedColumnName && sort.direction === "desc" ? (
          <ArrowDown size={16} />
        ) : sort.key === transformedColumnName && sort.direction === "asc" ? (
          <ArrowUp size={16} />
        ) : (
          <ArrowDownUp size={16} />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <UserDataTableToolbar
        filter={filter}
        setFilter={setFilter}
        searchTypes={["username", "email", "firstName", "lastName"]}
        table={table}
      />
      <div className="rounded-lg border border-primary-bdc overflow-hidden shadow-md bg-white dark:bg-gray-800/30">
        <div className="bg-background-primary-purple px-4 py-3 border-b border-primary-bdc">
          <LabelShadcn
            translate
            text="user-management:title.user-management-title"
            className="text-lg font-semibold text-center text-primary-purple"
          />
        </div>
        <Table className="w-full">
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  if (header.id === "orderNumber" || header.id === "gender")
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="py-4 font-semibold text-gray-700 dark:text-gray-200"
                      >
                        <LabelShadcn
                          translate
                          text={`user-management:fields.${changeTextCasesToAnother({ input: header.id, fromCase: "camelCase", toCase: "kebab-case" })}`}
                          inheritedClass
                          className="text-inherit text-nowrap"
                        />
                      </TableHead>
                    );
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="cursor-pointer py-4 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-all"
                      onClick={() => handleSort(header.id)}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="truncate max-w-[200px]">
                          <LabelShadcn
                            translate
                            text={`user-management:fields.${changeTextCasesToAnother({ input: header.id, fromCase: "camelCase", toCase: "kebab-case" })}`}
                            inheritedClass
                            className="text-inherit cursor-pointer"
                          />
                        </div>
                        <div className="text-primary-purple">{sortingElement(header.id)}</div>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="relative h-[400px] w-full overflow-hidden">
                    <Skeleton className="h-full w-full absolute inset-0" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-primary-bdc animate-spin"></div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`cursor-pointer border-b hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800/10" : "bg-gray-50/50 dark:bg-gray-800/30"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-4">
                      {typeof cell.getValue() === "string" && (cell?.getValue() as string).length > 20 ? (
                        <LabelShadcn
                          text={cell?.getValue() as string}
                          truncate
                          truncateLength={20}
                          inheritedClass
                          className="font-medium"
                        />
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 py-10 text-gray-400">
                    <div className="relative w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <LabelShadcn translate text="common:text.no-results" className="text-lg font-medium" />
                      <LabelShadcn
                        translate
                        text="common:text.try-adjusting-your-search-or-filter"
                        className="text-gray-500 dark:text-gray-400 mt-1"
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getRowModel().rows?.length > 0 && (
        <div className="rounded-lg border border-primary-bdc p-3 shadow-md bg-white dark:bg-gray-800/30">
          <UserDataTablePagination
            table={table}
            recordPerPageOptions={recordPerPageOptions}
            recordPerPage={recordPerPage}
            setRecordPerPage={setRecordPerPage}
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
