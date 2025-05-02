export type PaginatedListType<T> = {
  payload: T[];
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
};
