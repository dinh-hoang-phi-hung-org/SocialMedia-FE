import React from "react";
import { Card } from "@/shared/components/ui/card";
import { TUser } from "@/shared/types/common-type/user-type";
import UserList from "./_components/UserList";

export default function UserPage() {
  return (
    <Card className="2xl:mx-60 xl:mx-28 min-h-[calc(100vh-2.5rem)]">
      <UserList<TUser> typeString="User" />
    </Card>
  );
}
