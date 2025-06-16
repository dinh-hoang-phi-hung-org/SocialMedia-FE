import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { GetResponse } from "@/shared/types/common-type/api-type";
import { httpClient } from "@/shared/utils/api";
import { DashboardStats, AnalyticsData, DateRange } from "@/shared/types/common-type/analytics-type";

interface IAnalystService {
  getDashboardStats(): Promise<GetResponse<DashboardStats>>;
  getUserRegistrations(dateRange: DateRange): Promise<GetResponse<AnalyticsData[]>>;
  getPostsCreation(dateRange: DateRange): Promise<GetResponse<AnalyticsData[]>>;
  getReportsData(dateRange: DateRange): Promise<GetResponse<AnalyticsData[]>>;
}

export class AnalystService implements IAnalystService {
  private readonly requestBuilder: IRequestBuilder;
  private static instance: AnalystService;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  public static getInstance(requestBuilder: IRequestBuilder): AnalystService {
    if (!AnalystService.instance) {
      AnalystService.instance = new AnalystService(requestBuilder);
    }
    return AnalystService.instance;
  }

  public async getDashboardStats(): Promise<GetResponse<DashboardStats>> {
    return await httpClient.get<DashboardStats>({
      url: this.requestBuilder.buildUrl("dashboard"),
    });
  }

  public async getUserRegistrations(dateRange: DateRange): Promise<GetResponse<AnalyticsData[]>> {
    return await httpClient.get<AnalyticsData[]>({
      url: this.requestBuilder.buildUrl("users-registration"),
      config: {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          period: dateRange.period,
        },
      },
    });
  }

  public async getPostsCreation(dateRange: DateRange): Promise<GetResponse<AnalyticsData[]>> {
    return await httpClient.get<AnalyticsData[]>({
      url: this.requestBuilder.buildUrl("posts-creation"),
      config: {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          period: dateRange.period,
        },
      },
    });
  }

  public async getReportsData(dateRange: DateRange): Promise<GetResponse<AnalyticsData[]>> {
    return await httpClient.get<AnalyticsData[]>({
      url: this.requestBuilder.buildUrl("reports"),
      config: {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          period: dateRange.period,
        },
      },
    });
  }
}

const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("analytics");
export const analystService = AnalystService.getInstance(requestBuilder);
