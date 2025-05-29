import { GetResponse, PostResponse } from "@/shared/types/common-type/api-type";
import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { httpClient } from "@/shared/utils/api";
import { TReport, TReportCreate } from "@/shared/types/common-type/report-type";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";

interface IReportService {
  getReportsByType(params: PaginationParamsType, type: string): Promise<GetResponse<TReport>>;
  createReport(report: TReportCreate): Promise<PostResponse<{ message: string }>>;
}

export class ReportService implements IReportService {
  private readonly requestBuilder: IRequestBuilder;
  private static instance: ReportService;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  public static getInstance(requestBuilder: IRequestBuilder): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService(requestBuilder);
    }
    return ReportService.instance;
  }

  public async createReport(report: TReportCreate): Promise<PostResponse<{ message: string }>> {
    return await httpClient.post<{ message: string }, TReportCreate>({
      url: this.requestBuilder.buildUrl(),
      body: report,
    });
  }

  public async getReportsByType(params: PaginationParamsType, type: string): Promise<GetResponse<TReport>> {
    return await httpClient.get<TReport>({
      url: this.requestBuilder.buildUrl(`${type}`),
      config: {
        params,
      },
    });
  }

  public async getReportByUuid(type: string, reportUuid: string): Promise<GetResponse<TReport>> {
    return await httpClient.get<TReport>({
      url: this.requestBuilder.buildUrl(`${type}/${reportUuid}`),
    });
  }

  public async updateReport(
    reportUuid: string,
    status: string,
    type: string,
  ): Promise<PostResponse<{ message: string }>> {
    return await httpClient.patch<{ message: string }, { status: string; reportUuid: string }>({
      url: this.requestBuilder.buildUrl(`${type}/update-status/${reportUuid}/${status}`),
      body: { status, reportUuid },
    });
  }
}

const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("report");
export const reportService = ReportService.getInstance(requestBuilder);
