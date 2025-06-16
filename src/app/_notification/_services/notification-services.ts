import { IRequestBuilder, RequestBuilder } from "@/shared/utils/api/request-builder";
import { TNotification } from "@/shared/types/common-type/notification-type";
import { GetResponse } from "@/shared/types/common-type/api-type";
import { PaginationParamsType } from "@/shared/types/common-type/pagination-params-type";
import { httpClient } from "@/shared/utils/api";

interface INotificationService {
  getNotifications(query: PaginationParamsType): Promise<GetResponse<TNotification>>;
  markAsRead(uuid: string): Promise<GetResponse<TNotification>>;
}

export class NotificationService implements INotificationService {
  private readonly requestBuilder: IRequestBuilder;
  private static instance: NotificationService;

  constructor(requestBuilder: IRequestBuilder) {
    this.requestBuilder = requestBuilder;
  }

  public static getInstance(requestBuilder: IRequestBuilder): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(requestBuilder);
    }
    return NotificationService.instance;
  }

  public getNotifications(query: PaginationParamsType): Promise<GetResponse<TNotification>> {
    return httpClient.get<TNotification>({
      url: this.requestBuilder.buildUrl(),
      config: {
        params: query,
      },
    });
  }

  public markAsRead(uuid: string): Promise<GetResponse<TNotification>> {
    return httpClient.post<TNotification, null>({
      url: this.requestBuilder.buildUrl(`seen/${uuid}`),
      body: null,
    });
  }
}
const requestBuilder = new RequestBuilder();
requestBuilder.setResourcePath("notifications");
export const notificationService = NotificationService.getInstance(requestBuilder);
