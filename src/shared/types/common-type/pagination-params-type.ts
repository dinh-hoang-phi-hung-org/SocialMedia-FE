export type PaginationParamsType = Partial<{
  page: number;
  limit: number;
  searchFields: string;
  searchValue: string;
  sortBy: string;
  sortDirection: "ASC" | "DESC";
}>;
