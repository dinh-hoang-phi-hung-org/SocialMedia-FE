"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAnalytics } from "@/shared/hooks/useAnalytics";
import { FaUser } from "react-icons/fa6";
import { TbMessageReportFilled } from "react-icons/tb";
import { BsFillPostcardHeartFill } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { LineChart } from "@/shared/components/BaseLayouts/Chart/LineChart";
import { StatCard } from "@/app/admin/_components/StatCard";
import { useTranslation } from "next-i18next";

const AdminPage = () => {
  const { t } = useTranslation();
  const { loading, error, dashboardStats, userRegistrations, postsCreation, reportsData, fetchAllAnalytics } =
    useAnalytics();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    period: "day" as "day" | "week" | "month",
  });

  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchAllAnalytics(dateRange);
    }
  }, []);

  useEffect(() => {
    if (initialLoadRef.current) {
      fetchAllAnalytics(dateRange);
    }
  }, [dateRange.startDate, dateRange.endDate, dateRange.period]);

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl">
                <TbMessageReportFilled />
              </div>
              <div className="ml-6">
                <LabelShadcn
                  text="admin:error.error-loading-data"
                  translate
                  className="text-xl font-bold text-red-800 mb-2"
                />
                <LabelShadcn text={error} translate className="text-red-700 font-medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            <LabelShadcn text="admin:admin.dashboard-admin" translate className="text-white" />
          </div>
          <LabelShadcn
            text="admin:admin.dashboard-admin-description"
            translate
            className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-4"
          />
        </div>

        {/* Compact Date Range Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-8 border border-white/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <LabelShadcn text="common:filter.description" translate className="text-sm font-semibold text-gray-700" />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <LabelShadcn
                  text="common:filter.from"
                  translate
                  className="text-xs font-medium text-gray-600 min-w-0"
                />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 bg-white/60 backdrop-blur-sm hover:border-purple-300 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <LabelShadcn text="common:filter.to" translate className="text-xs font-medium text-gray-600 min-w-0" />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 bg-white/60 backdrop-blur-sm hover:border-purple-300 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <LabelShadcn
                  text="common:filter.period"
                  translate
                  className="text-xs font-medium text-gray-600 min-w-0"
                />
                <select
                  value={dateRange.period}
                  onChange={(e) => handleDateRangeChange("period", e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 bg-white/60 backdrop-blur-sm hover:border-purple-300 min-w-0"
                >
                  <option value="day">{t("common:filter.day")}</option>
                  <option value="week">{t("common:filter.week")}</option>
                  <option value="month">{t("common:filter.month")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin" />
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" />
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-pink-600 rounded-full animate-spin animate-reverse" />
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatCard
              title="admin:title-card.total-users"
              value={dashboardStats.totalUsers}
              icon={<FaUser />}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              title="admin:title-card.active-users"
              value={dashboardStats.activeUsers}
              icon={<FaCheck />}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              subtitle={`${((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100).toFixed(1)}% ${t("admin:chart.total-users")}`}
            />
            <StatCard
              title="admin:title-card.total-posts"
              value={dashboardStats.totalPosts}
              icon={<BsFillPostcardHeartFill />}
              gradient="bg-gradient-to-br from-purple-500 to-violet-600"
            />
            <StatCard
              title="admin:title-card.pending-reports"
              value={dashboardStats.pendingReports}
              icon={<TbMessageReportFilled />}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              subtitle={`${dashboardStats.totalReports} ${t("admin:chart.total-reports")}`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <LineChart data={userRegistrations} title="admin:title-chart.user-registrations" color="bg-blue-500" />
          <LineChart data={postsCreation} title="admin:title-chart.posts-creation" color="bg-purple-500" />
        </div>

        {/* Enhanced Reports Chart */}
        <div className="mb-12">
          <LineChart data={reportsData} title="admin:title-chart.reports-data" color="bg-amber-500" />
        </div>

        {/* Enhanced Footer */}
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 animate-pulse" />
            <LabelShadcn
              text={`admin:footer.last-updated ${new Date().toLocaleString("vi-VN")}`}
              translate
              className="text-sm text-gray-600 font-medium"
              splitAndTranslate
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
