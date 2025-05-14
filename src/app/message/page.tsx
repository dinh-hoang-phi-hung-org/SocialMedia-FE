"use client";

import { useState } from "react";
import PeopleList from "./_components/PeopleList";
import ChatSection from "./_components/ChatSection";
import { Card } from "@/shared/components/ui/card";

export default function InstagramPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <Card className="flex mx-20 h-[calc(100vh-2.5rem)]">
      {/* Sidebar with people list */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-800">
        <PeopleList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
      </div>

      {/* Main chat area */}
      <div className="flex-1">
        {selectedUser ? (
          <ChatSection receiverUuid={selectedUser} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </Card>
  );
}
