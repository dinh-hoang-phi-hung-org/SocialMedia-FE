export interface AnalyticsData {
  date: string;
  count: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalReports: number;
  pendingReports: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  period: "day" | "week" | "month";
}
