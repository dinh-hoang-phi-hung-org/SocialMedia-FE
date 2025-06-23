import React from "react";
import { Card } from "@/shared/components/ui/card";
import { TUser } from "@/shared/types/common-type/user-type";
import UserList from "./_components/UserList";

export default function UserPage() {
  return (
    <Card className="xl:mx-60 md:mx-20 xl:min-h-[calc(100vh-2.5rem)] md:mb-20 xl:mb-0 my-5">
      <UserList<TUser> typeString="User" />
    </Card>
  );
}
