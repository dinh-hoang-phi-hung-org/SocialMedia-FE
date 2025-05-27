"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import { Select, SelectTrigger, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { useTranslation } from "react-i18next";

import { FilterProperty } from "@/shared/types/common-type/shared-types";
// import { DateRange } from "react-day-picker";
// import { DatePicker } from "@/shared/components/Atoms/DatePicker/DatePicker";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import UserDataTableViewOptions from "./UserDataTableViewOptions";
import { changeTextCasesToAnother } from "@/shared/helpers/kebab";

interface UserDataTableToolbarProps<TData> {
  readonly table: Table<TData>;
  readonly searchTypes: string[];
  readonly filter: FilterProperty;
  readonly setFilter: (filter: FilterProperty) => void;
}

export default function UserDataTableToolbar<TData>({
  table,
  searchTypes,
  filter,
  setFilter,
}: UserDataTableToolbarProps<TData>) {
  const [searchType, setSearchType] = useState("all");
  const { t } = useTranslation(["user-management", "common"]);
  const [searchValue, setSearchValue] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  //   const [dateRange, setDateRange] = useState<DateRange>();

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (searchType != "all") {
        const column = table.getColumn(searchType);
        if (!column) return;
      }

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const newTimeout = setTimeout(() => {
        setFilter({
          key:
            searchType === "username" || searchType === "email"
              ? searchType
              : changeTextCasesToAnother({ input: searchType, fromCase: "camelCase", toCase: "snake_case" }),
          value: value,
        });
      }, 1000);

      setSearchTimeout(newTimeout);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchType, table, searchTimeout],
  );

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

  const handleFilterTypeChange = (value: string) => {
    setSearchType(value);
    setSearchValue("");
    setFilter({
      key:
        value === "username" || value === "email"
          ? value
          : changeTextCasesToAnother({ input: value, fromCase: "camelCase", toCase: "snake_case" }),
      value: "",
    });
  };

  const handleClearFilter = () => {
    setSearchValue("");
    setSearchType("all");
    // setDateRange(undefined);
    setFilter({ key: "", value: "" });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Select value={searchType} onValueChange={handleFilterTypeChange}>
          <SelectTrigger className="h-8 w-40">
            <LabelShadcn
              translate
              text={`${searchType == "all" ? "common:filter.all" : `user-management:fields.${changeTextCasesToAnother({ input: searchType, fromCase: "camelCase", toCase: "kebab-case" })}`}`}
              truncate
              truncateLength={10}
              className="text-sm"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">
              <LabelShadcn translate text={`common:filter.all`} />
            </SelectItem>
            {searchTypes.map((type) => (
              <SelectItem key={type} value={type}>
                <LabelShadcn
                  translate
                  text={`user-management:fields.${changeTextCasesToAnother({ input: type, fromCase: "camelCase", toCase: "kebab-case" })}`}
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
        <Input
          placeholder={`${t("common:filter.filter-by")} ${t(`${searchType == "all" ? "common:filter.all" : `user-management:fields.${changeTextCasesToAnother({ input: searchType, fromCase: "camelCase", toCase: "kebab-case" })}`}`)}...`}
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="h-8 w-[150px] xl:w-[250px] truncate text-sm"
        />
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
