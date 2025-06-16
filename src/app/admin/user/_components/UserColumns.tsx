"use client";

import { Button } from "@/shared/components/ui/button";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { TUser } from "@/shared/types/common-type/user-type";
// import { Switch } from "@/shared/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
// import { useState } from "react";
// import { UpdateUserFormDialog } from "../../forms/UpdateUserFormDialog";
// import { DeleteUserFormDialog } from "../../forms/DeleteUserFormDialog";
// import { useToast } from "@/shared/hooks/useToast";

const defaultButtonStyles = "px-0 hover:bg-transparent";

// function ActionCell({ row }: { row: any }) {
//   const [open, setOpen] = useState(false);
//   const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button variant="ghost">
//           <LabelShadcn text="..." />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-40 p-2">
//         <div className="flex flex-col justify-start">
//           <Button
//             className="h-auto py-1 justify-start"
//             variant="ghost"
//             onClick={() => {
//               setIsUpdateDialogOpen(true);
//               setOpen(false);
//             }}
//           >
//             <LabelShadcn translate text="common:button.edit" />
//           </Button>
//           <Button
//             className="h-auto py-1 justify-start !text-red-500"
//             variant="ghost"
//             onClick={() => {
//               setIsDeleteDialogOpen(true);
//               setOpen(false);
//             }}
//           >
//             <LabelShadcn translate text="common:button.delete" />
//           </Button>
//         </div>
//       </PopoverContent>
//       <UpdateUserFormDialog
//         isOpen={isUpdateDialogOpen}
//         onClose={() => setIsUpdateDialogOpen(false)}
//         userData={row.original}
//       />
//       <DeleteUserFormDialog
//         isOpen={isDeleteDialogOpen}
//         onClose={() => setIsDeleteDialogOpen(false)}
//         userData={row.original}
//       />
//     </Popover>
//   );
// }

export default function useUserColumns() {
  // const toast = useToast();
  // const [loadingToggles, setLoadingToggles] = useState<Record<string, boolean>>({});

  // const handleToggle = (user: TUser) => async () => {
  //   if (loadingToggles[user.uuid]) return;

  //   try {
  //     setLoadingToggles((prev) => ({ ...prev, [user.uuid]: true }));

  //     await onToggleActive(user.uuid, !user.isActive);

  //     // toast.success({
  //     //   title: "user-management:notification.general.success",
  //     //   description: `${user.isActive ? "user-management:notification.success.deactivate" : "user-management:notification.success.activate"} : ${"common:text.colon"} ${user.username}`,
  //     //   splitAndTranslate: true,
  //     // });
  //   } catch (error) {
  //     // toast.error({
  //     //   title: "user-management:notification.general.error",
  //     //   description: `${"user-management:notification.error.activation"} : ${"common:text.colon"} ${error}`,
  //     //   splitAndTranslate: true,
  //     // });
  //   } finally {
  //     setLoadingToggles((prev) => ({ ...prev, [user.uuid]: false }));
  //   }
  // };

  const columns: ColumnDef<TUser>[] = [
    {
      id: "orderNumber",
      header: () => <LabelShadcn translate text="user-management:fields.no" />,
      cell: ({ row }) => <LabelShadcn text={String(row.index + 1)} />,
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.username" />
        </Button>
      ),
      cell: ({ row }) => <LabelShadcn text={row.getValue("username")} />,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.email" />
        </Button>
      ),
      cell: ({ row }) => <LabelShadcn text={row.getValue("email")} />,
      enableSorting: true,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.first-name" />
        </Button>
      ),
      cell: ({ row }) => <LabelShadcn translate text={row.getValue("firstName") || "common:text.n-a"} />,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.last-name" />
        </Button>
      ),
      cell: ({ row }) => <LabelShadcn translate text={row.getValue("lastName") || "common:text.n-a"} />,
    },
    {
      accessorKey: "gender",
      header: () => <LabelShadcn translate inheritedClass text="user-management:fields.gender" />,
      cell: ({ row }) => <LabelShadcn translate text={row.getValue("gender") || "common:text.n-a"} />,
    },
    {
      accessorKey: "followersCount",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.followers-count" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("followersCount");
        return (
          <LabelShadcn translate text={value !== null && value !== undefined ? String(value) : "common:text.n-a"} />
        );
      },
    },
    {
      accessorKey: "followingsCount",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.followings-count" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("followingsCount");
        return (
          <LabelShadcn translate text={value !== null && value !== undefined ? String(value) : "common:text.n-a"} />
        );
      },
    },
    {
      accessorKey: "postsCount",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.posts-count" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("postsCount");
        return (
          <LabelShadcn translate text={value !== null && value !== undefined ? String(value) : "common:text.n-a"} />
        );
      },
    },
    {
      accessorKey: "lastLogin",
      header: ({ column }) => (
        <Button
          className={defaultButtonStyles}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <LabelShadcn translate inheritedClass text="user-management:fields.last-login" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <LabelShadcn
            translate
            text={row.getValue("lastLogin") || "common:text.n-a"}
            inheritedClass
            className="text-primary-purple"
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
    // {
    //   accessorKey: "isActive",
    //   header: ({ column }) => (
    //     <Button
    //       className={defaultButtonStyles}
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       <LabelShadcn translate inheritedClass text="user-management:fields.is-active" />
    //       <ArrowUpDown />
    //     </Button>
    //   ),
    //   cell: ({ row }) => {
    //     return row.getValue("username") === "admin" ? null : (
    //       <Switch
    //         checked={row.getValue("isActive")}
    //         onCheckedChange={handleToggle(row.original)}
    //         disabled={loadingToggles[row.original.uuid]}
    //       />
    //     );
    //   },
    // },
    // {
    //   id: "actions",
    //   enableHiding: false,
    //   cell: ({ row }) => {
    //     // return row.getValue("username") === "admin" ? null : <ActionCell row={row} />;
    //     return null;
    //   },
    // },
  ];

  return columns;
}
