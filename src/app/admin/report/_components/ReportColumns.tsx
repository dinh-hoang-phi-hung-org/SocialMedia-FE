"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { TReport } from "@/shared/types/common-type/report-type";
import { ColumnDef } from "@tanstack/react-table";

const defaultButtonStyles = "px-0 hover:bg-transparent";

export default function useReportColumns() {
  const columns: ColumnDef<TReport>[] = [
    {
      id: "orderNumber",
      header: () => <LabelShadcn translate text="report-management:fields.order-number" />,
      cell: ({ row }) => <LabelShadcn text={String(row.index + 1)} />,
    },
    {
      accessorKey: "reporter",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.username" />
        </Button>
      ),
      cell: ({ row }) => {
        const reporter = row.original.reporter;
        return (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={reporter.profilePictureUrl || "/assets/images/sample-avatar.png"} />
              <AvatarFallback>
                <LabelShadcn text={reporter.username} />
              </AvatarFallback>
            </Avatar>
            <LabelShadcn text={reporter.username} inheritedClass className="text-primary-purple" />
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="report-management:fields.status" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <LabelShadcn
            text={`report-management:filter.${status}`}
            inheritedClass
            translate
            className={`border border-gray-300 rounded-md px-2 py-1 ${
              status === "pending"
                ? "text-yellow-500 bg-yellow-50 border-yellow-500"
                : status === "banned"
                  ? "text-red-500 bg-red-50 border-red-500"
                  : "text-green-500 bg-green-50 border-green-500"
            }`}
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.created-at" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <LabelShadcn
            // translate
            text={row.getValue("createdAt") || "common:text.n-a"}
            inheritedClass
            className="text-primary-purple"
          />
        );
      },
    },
    {
      accessorKey: "reviewedAt",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="report-management:fields.review-at" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <LabelShadcn
            translate
            text={row.getValue("reviewedAt") || "common:text.n-a"}
            inheritedClass
            className="text-primary-purple"
          />
        );
      },
    },
  ];

  return columns;
}
