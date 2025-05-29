import { TUserShortCut } from "./user-type";

export type ReportContentType = "post" | "comment";
export type ReportStatus = "pending" | "banned" | "closed";

export type TReport = {
  uuid: string;
  contentUuid: string;
  contentType: ReportContentType;
  details: string;
  createdAt: string;
  reporter: TUserShortCut;
  status: ReportStatus;
};

export type TReportCreate = {
  contentUuid: string;
  contentType: ReportContentType;
  details: string;
};
