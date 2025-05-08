import { PaginationParamsType } from "./pagination-params-type";
import {
  ApiSuccessResponse,
  DeleteResponse,
  GetListResponse,
  GetResponse,
  PostResponse,
  PutResponse,
} from "./api-type";
import { ReactNode } from "react";

export type Color = "primary" | "secondary" | "warning" | "success" | "danger" | "info" | "light" | "dark" | "default";

export type NotificationPosition = "center" | "top-right" | "top-left" | "bottom-right" | "bottom-left";

export type SortProperty = {
  key: string;
  direction: "asc" | "desc" | "default";
};

export type FilterProperty = {
  key: string;
  value: string;
};

export type TableHeaders = {
  [key: string]: TableHeader;
};

export type TableHeader = {
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  hidden?: boolean;
};

export type DetailFields = {
  [key: string]: DetailField;
};

export type DetailField = {
  label: string;
  changable?: boolean;
  required?: boolean;
  placeholder?: string;
  detailChangeable?: boolean;
  hidden?: boolean;
  inputType?: string;
};

export type ApplicationPath = {
  path: string;
  name: string;
  icon: ReactNode;
  description?: string;
  showInSideMenu?: boolean;
  dynamicHidden?: boolean;
  isPathOnly?: boolean;
  params?: { [key: string]: string };
  homePreview?: boolean;
  homeDescription?: string;
};

export type TypeTransferEntry = {
  // eslint-disable-next-line
  repository: any;
  headers?: TableHeaders;
  detailFields?: DetailFields;
};

export type TransferType = {
  headers?: TableHeaders;
  detailFields?: DetailFields;
  // eslint-disable-next-line
  repository: any;
  // eslint-disable-next-line
  otherAPIs?: Record<string, (...args: any[]) => Promise<ApiSuccessResponse<any>>>;
  listPath?: string;
  detailPath?: string;
};

export type AuthResponse = {
  path: string;
  message: string;
  token?: string;
};

export type ValidatorProps = {
  value: string;
  isUpdate: boolean;
  prefix?: string;
};

export type ValidatorResult = {
  resultType: Color;
  errorMessage: string | null;
  params?: {
    min?: string;
    max?: string;
    parts?: string[];
  };
};

export type BinaryFileResponse = {
  uuid: string;
};

export type BinaryFile = {
  uuid: string;
  binary: string;
};

export type TextCase =
  | "camelCase"
  | "kebab-case"
  | "snake_case"
  | "PascalCase"
  | "CONSTANT_CASE"
  | "dot.case"
  | "Header-Case"
  | "path-case"
  | "Sentence Case";

export type TextCaseInput = {
  input: string;
  fromCase: TextCase | "all";
  toCase: TextCase;
};
