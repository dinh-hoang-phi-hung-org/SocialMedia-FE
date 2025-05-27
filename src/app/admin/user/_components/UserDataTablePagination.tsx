import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useState } from "react";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { DropdownOption } from "@/shared/types/components-type/drop-down-type";

interface UserDataTablePaginationProps<TData> {
  readonly table: Table<TData>;
  readonly recordPerPageOptions: DropdownOption[];
  readonly recordPerPage: number;
  readonly setRecordPerPage: (recordPerPage: number) => void;
  readonly currentPage: number;
  readonly lastPage: number;
  readonly onPageChange: (page: number) => void;
}

export default function UserDataTablePagination<TData>({
  table,
  recordPerPageOptions,
  recordPerPage,
  setRecordPerPage,
  currentPage,
  lastPage,
  onPageChange,
}: UserDataTablePaginationProps<TData>) {
  const [page, setPage] = useState(currentPage);
  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setPage(page);
      onPageChange(page);
    }
    if (page < 1) {
      setPage(1);
    }
    if (page > lastPage) {
      setPage(lastPage);
    }
  };

  const goToFirst = () => {
    goToPage(1);
  };

  const goToLast = () => {
    goToPage(lastPage);
  };

  const goToPrevious = () => {
    goToPage(page - 1);
  };

  const goToNext = () => {
    goToPage(page + 1);
  };
  return (
    <div className="flex items-center justify-between">
      {/* <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
      </div> */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          {/* <p className="text-sm font-medium">Rows per page</p> */}
          <Select
            value={`${recordPerPage}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              setRecordPerPage(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[200px]">
              <SelectValue placeholder={recordPerPage} />
            </SelectTrigger>
            <SelectContent side="top" className="w-[200px] space-y-1">
              {recordPerPageOptions.map((option) => (
                <SelectItem key={option.value} value={`${option.value}`}>
                  <div className="flex flex-row gap-1">
                    <LabelShadcn text={`${option.label}`} translate={true} inheritedClass />
                    <LabelShadcn text={`common:pagination.records-per-page`} translate={true} inheritedClass />
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[50px] items-center justify-center text-sm font-medium">
          {currentPage} / {lastPage < currentPage ? currentPage : lastPage}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="h-8 w-8 p-0 lg:flex" onClick={() => goToFirst()} disabled={page == 1}>
            <ChevronsLeft />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={() => goToPrevious()} disabled={page == 1}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={() => goToNext()} disabled={page == lastPage}>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className=" h-8 w-8 p-0 lg:flex"
            onClick={() => goToLast()}
            disabled={page == lastPage}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
