"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";

import { Select, SelectTrigger, SelectContent, SelectItem } from "@/shared/components/ui/select";

import { FilterProperty } from "@/shared/types/common-type/shared-types";
// import { DateRange } from "react-day-picker";
// import { DatePicker } from "@/shared/components/Atoms/DatePicker/DatePicker";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import UserDataTableViewOptions from "./ReportDataTableViewOptions";

interface ReportDataTableToolbarProps<TData> {
  readonly table: Table<TData>;
  readonly statusTypes: string[];
  readonly filter: FilterProperty;
  readonly setFilter: (filter: FilterProperty) => void;
  readonly contentTypes: string[];
  readonly setContentType: (contentType: string) => void;
}

export default function ReportDataTableToolbar<TData>({
  table,
  statusTypes,
  filter,
  setFilter,
  contentTypes,
  setContentType,
}: ReportDataTableToolbarProps<TData>) {
  const [contentType, setContentTypeDisplay] = useState("post");
  const [status, setStatusDisplay] = useState("all");
  //   const [dateRange, setDateRange] = useState<DateRange>();


  //   const handleApplyDateRange = () => {
  //     if (dateRange) {
  //       const fromDate = dateRange.from;
  //       const toDate = dateRange.to;
  //       setSearchType(searchType);
  //       setFilter({
  //         key: searchType,
  //         value: (fromDate?.toISOString() || "") + "+" + (toDate?.toISOString() || ""),
  //       });
  //     }
  //   };

  const handleFilterTypeReportChange = (value: string) => {
    setContentTypeDisplay(value);
    setContentType(value);
  };

  const handleFilterTypeChange = (value: string) => {
    setStatusDisplay(value);
    if (value != "all") {
      setFilter({
        key: "status",
        value,
      });
    } else {
      setFilter({ key: "", value: "" });
    }
  };



  const handleClearFilter = () => {
    setStatusDisplay("all");
    setContentTypeDisplay("post");
    setFilter({ key: "", value: "" });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Select value={contentType} onValueChange={handleFilterTypeReportChange}>
          <SelectTrigger className="h-8 w-40">
            <LabelShadcn translate text={`report-management:filter.${contentType}`} truncate truncateLength={10} className="text-sm" />
          </SelectTrigger>
          <SelectContent>
            {contentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                <LabelShadcn
                  translate
                  text={`report-management:filter.${type}`}
                  className="text-sm"
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={handleFilterTypeChange}>
          <SelectTrigger className="h-8 w-40">
            <LabelShadcn
              translate
              text={`${status == "all" ? "common:filter.all" : `report-management:filter.${status}`}`}
              truncate
              truncateLength={10}
              className="text-sm"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">
              <LabelShadcn translate text={`common:filter.all`} />
            </SelectItem>
            {statusTypes.map((type) => (
              <SelectItem key={type} value={type}>
                <LabelShadcn
                  translate
                  text={`report-management:filter.${type}`}
                  className="text-sm"
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* {searchType === "createdAt" || searchType === "updatedAt" || searchType === "lastLogin" ? (
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <DatePicker mode="range" date={dateRange} onDateChange={(date) => setDateRange(date as DateRange)} />
              <Button variant="default" onClick={handleApplyDateRange}>
                <LabelShadcn translate text="audit-log:button.apply" className="cursor-pointer" />
              </Button>
            </div>
          </div>
        ) : (
          <Input
            placeholder={`${t("user-management:fields.filterBy")} ${t(`${searchType == "all" ? "common:fields.all" : `user-management:fields.${searchType}`}`)}...`}
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px] truncate"
          />
        )} */}
        {filter && filter.value != "" && (
          <Button variant="ghost" onClick={handleClearFilter} className="h-8 px-2 lg:px-3 bg-background-primary-purple">
            <X />
          </Button>
        )}
      </div>
      <UserDataTableViewOptions table={table} />
    </div>
  );
}
