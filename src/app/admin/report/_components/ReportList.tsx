"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import { DefaultItemType } from "@/shared/types/common-type/default-item-type";
import { FilterProperty, SortProperty } from "@/shared/types/common-type/shared-types";
import { DropdownOption } from "@/shared/types/components-type/drop-down-type";
import { ColumnDef } from "@tanstack/react-table";
import getReportsByType from "./ReportColumns";
import { TypeTransfer } from "@/shared/constants/type-transfer";
// import { Button } from "@/shared/components/ui/button";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { ListFetchOptionProperties, ListProps } from "@/shared/types/components-type/list-type";
import { FaUser } from "react-icons/fa";
import ReportDataTable from "./ReportDataTable";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { TReport } from "@/shared/types/common-type/report-type";
const List = <T extends DefaultItemType>(props: ListProps<T>) => {
  //   const toast = useToast();
  // const router = useRouter();
  const [page, setPage] = useState(1);
  const [listItems, setListItems] = useState<T[]>(props.items ? props.items : []);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    lastPage: 1,
  });
  const [filter, setFilter] = useState<FilterProperty>({ key: "", value: "" });
  const [recordPerPage, setRecordPerPage] = useState(5);
  const [contentType, setContentType] = useState("post");
  const [recordPerPageOptions, setRecordPerPageOptions] = useState<DropdownOption[]>([
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "20", value: 20 },
  ]);
  const [previousSuccessFetchOptions, setPreviousSuccessFetchOptions] = useState<ListFetchOptionProperties | null>(
    null,
  );
  const [refetch, setRefetch] = useState(false);
  const [sort, setSort] = useState<SortProperty | null>(null);
  const getListAPI = async (filter: PaginationParamsType, contentType: string) => {
    const response = await TypeTransfer[props.typeString]?.otherAPIs?.getReportsByType(filter, contentType);
    return response;
  };

  const columns = getReportsByType();

  useEffect(() => {
    listFetch();
    // eslint-disable-next-line
  }, [props.items, page, sort, filter, recordPerPage, contentType, refetch]);

  const calcRecordPerPageBasedOnNumberOfPage = (totalRecord?: number) => {
    let total = 0;
    if (totalRecord) {
      total = totalRecord;
    } else if (props.items) {
      total = props.items.length;
    } else {
      total = meta.total;
    }

    if (total <= 20) {
      setRecordPerPageOptions([
        { label: "5", value: 5 },
        { label: "10", value: 10 },
        { label: "20", value: 20 },
      ]);
    } else if (total <= 50) {
      setRecordPerPageOptions([
        { label: "5", value: 5 },
        { label: "10", value: 10 },
        { label: "20", value: 20 },
        { label: "30", value: 30 },
        { label: "50", value: 50 },
      ]);
    } else {
      setRecordPerPageOptions([
        { label: "5", value: 5 },
        { label: "10", value: 10 },
        { label: "20", value: 20 },
        { label: "50", value: 50 },
        { label: "100", value: 100 },
      ]);
    }
  };

  const listFetch = () => {
    if (props.items) {
      handleGivenList(sort || undefined, filter);
      calcRecordPerPageBasedOnNumberOfPage();
      setLoading(false);
    } else {
      setLoading(true);
      handleGetList({ page: page, sort: sort || undefined, filter: filter, recordPerPage: recordPerPage });
    }
  };

  const handleGetList = async (fetchOptions: ListFetchOptionProperties) => {
    try {
      if (previousSuccessFetchOptions != null) {
        // case only change record per page: set page to last page if invalid
        if (
          previousSuccessFetchOptions.recordPerPage &&
          fetchOptions.recordPerPage &&
          previousSuccessFetchOptions.recordPerPage != fetchOptions.recordPerPage
        ) {
          const pageCount = Math.ceil(meta.total / fetchOptions.recordPerPage);
          if (fetchOptions.page > pageCount) {
            setPreviousSuccessFetchOptions({ ...fetchOptions, page: pageCount });
            setPage(pageCount);
            return;
          }
        } else if (
          fetchOptions.page != 1 &&
          previousSuccessFetchOptions.page === fetchOptions.page &&
          (previousSuccessFetchOptions.sort !== fetchOptions.sort ||
            previousSuccessFetchOptions.filter !== fetchOptions.filter)
        ) {
          // case change filter or sort without changing page: reset page to 1
          setPreviousSuccessFetchOptions({ ...fetchOptions, page: 1 });
          setPage(1);
          return;
        }
      }
      if (fetchOptions.filter?.value && fetchOptions.filter?.key === "") {
        const headers = TypeTransfer[props.typeString].headers;
        const allKeys = headers
          ? Object.entries(headers)
              .filter(([key, header]) => key && !header.hidden && header.searchable)
              .map(([key]) => key)
          : [];
        setFilter({ key: allKeys.join(","), value: fetchOptions.filter.value });
        return;
      }
      const listItems = await getListAPI?.(
        {
          page: fetchOptions.page,
          limit: fetchOptions.recordPerPage,
          searchFields: fetchOptions.filter?.key,
          searchValue: fetchOptions.filter?.value,
          sortBy: fetchOptions.sort?.key,
          sortDirection: fetchOptions.sort?.direction === "asc" ? "ASC" : "DESC",
        },
        contentType,
      );
      setListItems(listItems?.payload?.data ?? []);
      setMeta(listItems?.payload?.meta ?? { total: 0, page: 1, lastPage: 1 });
      setPreviousSuccessFetchOptions(fetchOptions);
      calcRecordPerPageBasedOnNumberOfPage(listItems?.payload?.meta?.total);
      // eslint-disable-next-line
    } catch (error) {
      setListItems([]);
      setPage(1);
      setRecordPerPage(recordPerPageOptions[0].value);
      setPreviousSuccessFetchOptions({ page: 1 });
      setMeta({
        total: 0,
        page: 1,
        lastPage: 1,
      });

      //   toast.error({
      //     title: "common:notification.error",
      //     description: (error as Error).message || "common:message.get-list-failed",
      //   });
    } finally {
      setLoading(false);
    }
  };

  const handleGivenList = (sort?: SortProperty, filter?: FilterProperty) => {
    let listItemData = [...listItems];
    if (sort) {
      listItemData = listItemData.sort((a, b) => {
        const aValue = String(a[sort.key as keyof T]);
        const bValue = String(b[sort.key as keyof T]);
        const isAscending = sort.direction === "asc";
        const compareResult = aValue > bValue ? 1 : -1;
        return isAscending ? compareResult : -compareResult;
      });
    }
    if (filter?.key) {
      listItemData = listItemData.filter((item) => item[filter.key as keyof T]?.toString()?.includes(filter.value));
    }
    setListItems(listItemData);
  };

  const getOrderNumber = (rowIndex: number) => {
    return (meta.page - 1) * recordPerPage + rowIndex + 1;
  };

  const typedColumns: ColumnDef<T>[] = [
    {
      ...columns[0],
      cell: ({ row }) => <div>{getOrderNumber(row.index)}</div>,
    },
    ...columns.slice(1),
  ] as ColumnDef<T>[];

  //   const handleRowClick = (user: T & { username?: string }) => {
  //     router.push(`${TypeTransfer[props.typeString].detailPath}/${user.uuid}`);
  //   };

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-5">
          <FaUser className="w-10 h-10 text-primary-purple" />
          <div className="flex flex-col">
            <LabelShadcn
              translate
              className="text-3xl font-bold tracking-tight"
              text="report-management:title.report-management-title"
            />{" "}
            <LabelShadcn translate className="text-muted-foreground" text="report-management:title.description" />
          </div>
        </div>
      </div>
      <ReportDataTable<T, unknown>
        loading={loading}
        recordPerPageOptions={recordPerPageOptions}
        data={listItems}
        columns={typedColumns}
        recordPerPage={recordPerPage}
        setRecordPerPage={setRecordPerPage}
        contentType={contentType}
        setContentType={setContentType}
        currentPage={meta.page}
        lastPage={meta.lastPage}
        filter={filter}
        setFilter={setFilter}
        sort={sort || { key: "", direction: "asc" }}
        setSort={setSort}
        onPageChange={(page) => {
          setPage(page);
        }}
        onRefetch={() => setRefetch(!refetch)}
        // onRowClick={handleRowClick}
      />
    </div>
  );
};

export default List;
