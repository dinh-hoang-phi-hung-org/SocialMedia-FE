"use client";

import { useState, useCallback, useMemo } from "react";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { DashboardStats, AnalyticsData, DateRange } from "@/shared/types/common-type/analytics-type";

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<AnalyticsData[]>([]);
  const [postsCreation, setPostsCreation] = useState<AnalyticsData[]>([]);
  const [reportsData, setReportsData] = useState<AnalyticsData[]>([]);

  const analyticsService = useMemo(() => TypeTransfer.Analytics, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setError(null);
      const response = await TypeTransfer["Analytics"]?.otherAPIs?.getDashboardStats();
      if (response?.success) {
        setDashboardStats(response.payload);
        return response.payload;
      } else {
        throw new Error("admin:error.failed-to-fetch-dashboard-stats");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard stats";
      setError(errorMessage);
      throw err;
    }
  }, [analyticsService]);

  const fetchUserRegistrations = useCallback(async (dateRange: DateRange) => {
    try {
      setError(null);
      const response = await TypeTransfer["Analytics"]?.otherAPIs?.getUserRegistrations(dateRange);
      if (response?.success) {
        setUserRegistrations(response.payload);
        return response.payload;
      } else {
        throw new Error("admin:error.failed-to-fetch-user-registrations");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user registrations";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const fetchPostsCreation = useCallback(
    async (dateRange: DateRange) => {
      try {
        setError(null);
        const response = await TypeTransfer["Analytics"]?.otherAPIs?.getPostsCreation(dateRange);
        if (response?.success) {
          setPostsCreation(response.payload);
          return response.payload;
        } else {
          throw new Error("admin:error.failed-to-fetch-posts-creation");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch posts creation";
        setError(errorMessage);
        throw err;
      }
    },
    [analyticsService],
  );

  const fetchReportsData = useCallback(
    async (dateRange: DateRange) => {
      try {
        setError(null);
        const response = await TypeTransfer["Analytics"]?.otherAPIs?.getReportsData(dateRange);
        if (response?.success) {
          setReportsData(response.payload);
          return response.payload;
        } else {
          throw new Error("admin:error.failed-to-fetch-reports-data");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch reports data";
        setError(errorMessage);
        throw err;
      }
    },
    [analyticsService],
  );

  const fetchAllAnalytics = useCallback(
    async (dateRange: DateRange) => {
      if (loading) return; // Prevent multiple simultaneous calls

      try {
        setLoading(true);
        setError(null);

        const promises = [
          fetchDashboardStats(),
          fetchUserRegistrations(dateRange),
          fetchPostsCreation(dateRange),
          fetchReportsData(dateRange),
        ];

        await Promise.allSettled(promises);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [loading, fetchDashboardStats, fetchUserRegistrations, fetchPostsCreation, fetchReportsData],
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const resetData = useCallback(() => {
    setDashboardStats(null);
    setUserRegistrations([]);
    setPostsCreation([]);
    setReportsData([]);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    dashboardStats,
    userRegistrations,
    postsCreation,
    reportsData,

    // Actions
    fetchDashboardStats: useCallback(async () => {
      if (loading) return;
      setLoading(true);
      try {
        await fetchDashboardStats();
      } finally {
        setLoading(false);
      }
    }, [loading, fetchDashboardStats]),

    fetchUserRegistrations: useCallback(
      async (dateRange: DateRange) => {
        if (loading) return;
        setLoading(true);
        try {
          await fetchUserRegistrations(dateRange);
        } finally {
          setLoading(false);
        }
      },
      [loading, fetchUserRegistrations],
    ),

    fetchPostsCreation: useCallback(
      async (dateRange: DateRange) => {
        if (loading) return;
        setLoading(true);
        try {
          await fetchPostsCreation(dateRange);
        } finally {
          setLoading(false);
        }
      },
      [loading, fetchPostsCreation],
    ),

    fetchReportsData: useCallback(
      async (dateRange: DateRange) => {
        if (loading) return;
        setLoading(true);
        try {
          await fetchReportsData(dateRange);
        } finally {
          setLoading(false);
        }
      },
      [loading, fetchReportsData],
    ),

    fetchAllAnalytics,
    resetError,
    resetData,
  };
};
