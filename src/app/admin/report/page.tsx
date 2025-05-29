import React from "react";
import { Card } from "@/shared/components/ui/card";
import ReportList from "./_components/ReportList";
import { TReport } from "@/shared/types/common-type/report-type";

export default function UserPage() {
  return (
    <Card className="2xl:mx-60 xl:mx-28 min-h-[calc(100vh-2.5rem)]">
      <ReportList<TReport> typeString="Report" />
    </Card>
  );
}
