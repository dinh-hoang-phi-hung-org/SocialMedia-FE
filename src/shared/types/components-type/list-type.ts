import { ReactNode } from "react";
import { ComponentDefaultProps } from "./component-default-type";
import { FilterProperty } from "../common-type/shared-types";
import { SortProperty } from "../common-type/shared-types";

export type ListProps<T> = ComponentDefaultProps & {
  items?: T[];
  typeString: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  listHoverSpeicalEffect?: boolean;
  // Filter
  filterForm?: ReactNode;
  filterFormTitle?: string;
  filterFormClassName?: string;
  // eslint-disable-next-line
  filterValidation?: (filterData: any) => boolean;
  // Insert
  insertForm?: ReactNode;
  insertFormTitle?: string;
  insertFormClassName?: string;
  // eslint-disable-next-line
  insertValidation?: (createData: any, isUpdate?: boolean) => boolean;
  // Update
  updateForm?: (updateData: T) => ReactNode;
  updateFormTitle?: string;
  updateFormClassName?: string;
  // eslint-disable-next-line
  updateValidation?: (updateData: any, isUpdate?: boolean) => boolean;
  // Delete
  deleteForm?: (deleteData: T) => ReactNode;
  deleteFormTitle?: string;
  deleteFormClassName?: string;
  // eslint-disable-next-line
  deleteValidation?: (deleteData: any) => boolean;
  // Error
  resetErrors?: () => void;
};

export type ListFetchOptionProperties = {
  page: number;
  sort?: SortProperty;
  filter?: FilterProperty;
  recordPerPage?: number;
};
